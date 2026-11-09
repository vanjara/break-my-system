const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Execute the shipped inline script, rather than a second copy of the model.
// This small DOM double covers state and text; real browser QA covers layout,
// focus, native dialog behavior and keyboard interactions (see docs/testing.md).
const html = fs.readFileSync(path.join(__dirname, '../docs/index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function makeElement() {
  const element = { textContent: '', className: '', disabled: false, style: {}, children: [], open: false };
  element.classList = {
    toggle(name, force) {
      const classes = new Set(element.className.split(/\s+/).filter(Boolean));
      const add = force === undefined ? !classes.has(name) : force;
      if (add) classes.add(name); else classes.delete(name);
      element.className = [...classes].join(' ');
      return add;
    },
    contains(name) { return element.className.split(/\s+/).includes(name); },
  };
  element.setAttribute = (name, value) => { element[name] = value; };
  element.append = (...children) => element.children.push(...children);
  element.replaceChildren = (...children) => { element.children = children; };
  element.showModal = () => { element.open = true; };
  element.close = () => { element.open = false; };
  element.getBoundingClientRect = () => ({ left: 100, right: 600, top: 100, bottom: 500 });
  return element;
}

function app() {
  const elements = new Map();
  for (const match of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)) {
    const el = makeElement();
    el.className = match[0].match(/class="([^"]*)"/)?.[1] || '';
    el.disabled = /\bdisabled\b/.test(match[0]);
    const textStart = match.index + match[0].length;
    el.textContent = html.slice(textStart).split('<')[0];
    assert.ok(!elements.has(match[1]), `Duplicate id: ${match[1]}`);
    elements.set(match[1], el);
  }
  let tick;
  const context = vm.createContext({
    document: {
      getElementById(id) {
        assert.ok(elements.has(id), `Missing element: ${id}`);
        return elements.get(id);
      },
      createElement: makeElement,
    },
    setInterval(callback) { assert.equal(tick, undefined); tick = callback; },
  });
  vm.runInContext(script, context);
  return {
    el: id => elements.get(id),
    click: id => elements.get(id).onclick(),
    seconds(count) { for (let i = 0; i < count; i++) tick(); },
    read(expression) { return JSON.parse(vm.runInContext(`JSON.stringify(${expression})`, context)); },
    run(code) { vm.runInContext(code, context); },
  };
}

test('fresh run starts one order, and the first pizza completes after 25 seconds', () => {
  const a = app();
  assert.equal(a.el('pause').disabled, true);
  a.click('start');
  assert.equal(a.read('state.received'), 1);
  assert.equal(a.read('state.cooking.length'), 1);
  a.seconds(24);
  assert.equal(a.read('state.served.length'), 0);
  a.seconds(1);
  assert.equal(a.read('state.served[0].time'), 25);
});

test('each supported demand rate receives exactly its scheduled orders', () => {
  for (let rate = 1; rate <= 20; rate++) {
    const a = app();
    a.click('start');
    a.run(`config.demand = ${rate}; render();`);
    a.seconds(60);
    assert.equal(a.read('state.received'), rate + 1, `Arrival count at ${rate}/min`);
  }
});

test('10/min arrivals occur every six seconds, without floating point delays', () => {
  const a = app();
  a.click('start');
  a.click('surge');
  a.seconds(6);
  assert.equal(a.read('state.received'), 2);
  assert.match(a.el('nextArrival').textContent, /6s/);
});

test('pause updates the visible state immediately and freezes the clock', () => {
  const a = app();
  a.click('start');
  a.click('pause');
  assert.equal(a.el('pause').textContent, 'Resume');
  assert.equal(a.el('recentEvent').textContent, 'Simulation paused.');
  a.seconds(30);
  assert.equal(a.read('state.seconds'), 0);
  a.click('pause');
  a.seconds(1);
  assert.equal(a.read('state.seconds'), 1);
});

test('restart after pausing restores the controls and the initial model', () => {
  const a = app();
  a.click('start'); a.click('surge'); a.click('oven'); a.click('switch');
  a.seconds(40); a.click('pause'); a.click('restart');
  assert.equal(a.el('pause').textContent, 'Pause');
  assert.equal(a.el('pause').disabled, true);
  assert.equal(a.read('softwareView'), false);
  assert.deepEqual(a.read('config'), { demand: 3, cooks: 1, ovens: 1 });
  assert.equal(a.read('state.received'), 0);
  a.click('start');
  assert.equal(a.el('pause').textContent, 'Pause');
  assert.equal(a.el('pause').disabled, false);
});

test('paused status takes precedence over an order that completed on this tick', () => {
  const a = app();
  a.click('start'); a.seconds(25);
  assert.match(a.el('recentEvent').textContent, /served just now/);
  a.click('pause');
  assert.equal(a.el('recentEvent').textContent, 'Simulation paused.');
  assert.match(a.el('dialogRunning').textContent, /paused/);
});

test('lowering demand after a surge does not claim that queues are growing', () => {
  const a = app();
  a.click('start'); a.click('surge');
  for (let i = 0; i < 9; i++) a.click('lessDemand');
  assert.equal(a.el('healthStatus').textContent, 'Healthy');
  assert.equal(a.el('title').textContent, 'Test demand against capacity');
});

test('resource and demand controls preserve work and enforce their limits', () => {
  const a = app();
  a.click('start'); a.click('surge'); a.seconds(120);
  const before = a.read('state');
  for (let i = 0; i < 10; i++) { a.click('cook'); a.click('oven'); }
  for (let i = 0; i < 50; i++) a.click('moreDemand');
  assert.deepEqual(a.read('state'), before);
  assert.deepEqual(a.read('config'), { demand: 20, cooks: 4, ovens: 3 });
  assert.equal(a.el('cook').disabled, true);
  assert.equal(a.el('oven').disabled, true);
  assert.equal(a.el('moreDemand').disabled, true);
  for (let i = 0; i < 50; i++) a.click('lessDemand');
  assert.equal(a.read('config.demand'), 1);
  assert.equal(a.el('lessDemand').disabled, true);
});

test('conservation, resource occupancy and eventual backlog recovery hold', () => {
  const a = app();
  a.click('start'); a.click('surge');
  for (let i = 0; i < 180; i++) {
    a.seconds(1);
    assert.equal(a.read('state.received'), a.read('state.waiting.length + state.cooking.length + state.prepared.length + state.baking.length + state.served.length'));
    assert.ok(a.read('state.cooking.length <= config.cooks && state.baking.length <= config.ovens'));
  }
  assert.ok(a.read('state.waiting.length + state.prepared.length') > 0);
  a.click('cook'); a.click('oven'); a.click('oven');
  a.seconds(1200);
  assert.equal(a.read('state.waiting.length + state.prepared.length'), 0);
  assert.equal(a.el('healthCapacity').textContent, '12/min');
});

test('at-capacity copy never promises that existing backlog will clear', () => {
  const a = app();
  a.click('start'); a.click('surge');
  for (let i = 0; i < 6; i++) a.click('lessDemand');
  assert.equal(a.el('healthStatus').textContent, 'At capacity');
  assert.match(a.el('capacityExplanation').textContent, /no (spare capacity|headroom)/i);
});

test('software view explains the same model in software terms, without resetting work', () => {
  const a = app();
  a.click('start'); a.click('surge'); a.seconds(20);
  const before = a.read('state');
  a.click('switch');
  assert.deepEqual(a.read('state'), before);
  assert.equal(a.el('healthBottleneck').textContent, 'Database');
  assert.match(a.el('dialogSummary').textContent, /app workers/i);
  assert.match(a.el('dialogSummary').textContent, /database/i);
  assert.doesNotMatch(a.el('dialogAdvice').textContent, /cook|oven|pizza/i);
  a.click('switch');
  assert.equal(a.el('healthBottleneck').textContent, 'Baking');
});

test('clicking dialog padding does not dismiss it, while a backdrop click does', () => {
  const a = app();
  a.click('whyBottleneck');
  const dialog = a.el('bottleneckDialog');
  dialog.onclick({ target: dialog, clientX: 110, clientY: 110 });
  assert.equal(dialog.open, true);
  dialog.onclick({ target: dialog, clientX: 20, clientY: 20 });
  assert.equal(dialog.open, false);
});
