import { DemoInterviewer } from '@/lib/demo-interviewer'

describe('Demo Interviewer', () => {
  it('should respond to user input', async () => {
    const interviewer = new DemoInterviewer('airport-bathroom', 'CLARIFY')
    const response = await interviewer.processUserInput('What is the capacity?')
    
    expect(response.message).toBeTruthy()
    expect(response.readinessScore).toBeGreaterThanOrEqual(0)
    expect(response.readinessScore).toBeLessThanOrEqual(100)
    expect(response.suggestedNextAction).toMatch(/continue|hint|advance/)
  })
  
  it('should detect readiness signals', async () => {
    const interviewer = new DemoInterviewer('airport-bathroom', 'CLARIFY')
    const response = await interviewer.processUserInput('I am ready to continue')
    
    expect(response.suggestedNextAction).toBe('advance')
    expect(response.readinessScore).toBeGreaterThan(70)
  })
  
  it('should offer hints when requested', async () => {
    const interviewer = new DemoInterviewer('airport-bathroom', 'CLARIFY')
    const response = await interviewer.processUserInput('I need a hint')
    
    expect(response.suggestedNextAction).toBe('hint')
  })
  
  it('should generate hints at different levels', () => {
    const interviewer = new DemoInterviewer('airport-bathroom', 'CLARIFY')
    
    const hint1 = interviewer.generateHint(1)
    const hint2 = interviewer.generateHint(2)
    const hint3 = interviewer.generateHint(3)
    
    expect(hint1).toBeTruthy()
    expect(hint2).toBeTruthy()
    expect(hint3).toBeTruthy()
    expect(hint1).not.toBe(hint2)
  })
  
  it('should detect reasoning signals', async () => {
    const interviewer = new DemoInterviewer('airport-bathroom', 'INITIAL_DESIGN')
    const response = await interviewer.processUserInput(
      'We need to consider capacity planning and identify bottlenecks'
    )
    
    expect(response.reasoningSignalsDetected.length).toBeGreaterThan(0)
  })
})
