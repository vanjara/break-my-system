'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Link, Move } from 'lucide-react'

export interface DiagramNode {
  id: string
  nodeType: string
  label: string
  x: number
  y: number
}

export interface DiagramEdge {
  id: string
  fromId: string
  toId: string
  label?: string
}

const NODE_TYPES = [
  { value: 'client', label: 'Client', color: '#3B82F6' },
  { value: 'api', label: 'API/Service', color: '#10B981' },
  { value: 'database', label: 'Database', color: '#8B5CF6' },
  { value: 'cache', label: 'Cache', color: '#F59E0B' },
  { value: 'queue', label: 'Queue', color: '#EF4444' },
  { value: 'worker', label: 'Worker', color: '#EC4899' },
  { value: 'external', label: 'External', color: '#6B7280' },
  { value: 'loadbalancer', label: 'Load Balancer', color: '#14B8A6' }
]

interface Props {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  onChange: (nodes: DiagramNode[], edges: DiagramEdge[]) => void
}

export default function DiagramEditor({ nodes, edges, onChange }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [draggingNode, setDraggingNode] = useState<string | null>(null)
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [connectMode, setConnectMode] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [canvasBounds, setCanvasBounds] = useState({ width: 800, height: 600 })
  
  useEffect(() => {
    const updateBounds = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        setCanvasBounds({ width: rect.width, height: rect.height })
      }
    }
    updateBounds()
    window.addEventListener('resize', updateBounds)
    return () => window.removeEventListener('resize', updateBounds)
  }, [])
  
  function addNode(nodeType: string) {
    const NODE_WIDTH = 128
    const NODE_HEIGHT = 80
    const maxX = canvasBounds.width - NODE_WIDTH - 20
    const maxY = canvasBounds.height - NODE_HEIGHT - 20
    
    const newNode: DiagramNode = {
      id: `node-${Date.now()}`,
      nodeType,
      label: NODE_TYPES.find(t => t.value === nodeType)?.label || nodeType,
      x: Math.min(Math.random() * 300 + 50, maxX),
      y: Math.min(Math.random() * 200 + 50, maxY)
    }
    onChange([...nodes, newNode], edges)
  }
  
  function deleteNode(nodeId: string) {
    const newNodes = nodes.filter(n => n.id !== nodeId)
    const newEdges = edges.filter(e => e.fromId !== nodeId && e.toId !== nodeId)
    onChange(newNodes, newEdges)
    setSelectedNode(null)
  }
  
  function startDrag(nodeId: string, e: React.MouseEvent) {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    
    setDraggingNode(nodeId)
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y
    })
  }
  
  function handleMouseMove(e: React.MouseEvent) {
    if (!canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    setMousePos({ x: mouseX, y: mouseY })
    
    if (draggingNode) {
      const NODE_WIDTH = 128
      const NODE_HEIGHT = 80
      let x = mouseX - dragOffset.x
      let y = mouseY - dragOffset.y
      
      // Constrain to canvas bounds
      x = Math.max(0, Math.min(x, canvasBounds.width - NODE_WIDTH))
      y = Math.max(0, Math.min(y, canvasBounds.height - NODE_HEIGHT))
      
      const newNodes = nodes.map(n =>
        n.id === draggingNode ? { ...n, x, y } : n
      )
      onChange(newNodes, edges)
    }
  }
  
  function handleMouseUp() {
    setDraggingNode(null)
  }
  
  function handleNodeClick(nodeId: string) {
    if (connectMode) {
      // In connect mode, clicking nodes creates edges
      if (connectingFrom === nodeId) {
        setConnectingFrom(null)
      } else if (connectingFrom) {
        // Complete connection
        const newEdge: DiagramEdge = {
          id: `edge-${Date.now()}`,
          fromId: connectingFrom,
          toId: nodeId,
          label: ''
        }
        onChange(nodes, [...edges, newEdge])
        setConnectingFrom(null)
      } else {
        setConnectingFrom(nodeId)
      }
    } else {
      // In move mode, clicking selects
      setSelectedNode(nodeId)
    }
  }
  
  function toggleConnectMode() {
    setConnectMode(!connectMode)
    setConnectingFrom(null)
  }
  
  function deleteEdge(edgeId: string) {
    const newEdges = edges.filter(e => e.id !== edgeId)
    onChange(nodes, newEdges)
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex gap-2">
            <button
              onClick={toggleConnectMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded font-medium transition-colors ${
                connectMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              title={connectMode ? 'Switch to Move mode' : 'Switch to Connect mode'}
            >
              {connectMode ? <Link className="w-4 h-4" /> : <Move className="w-4 h-4" />}
              {connectMode ? 'Connect Mode' : 'Move Mode'}
            </button>
          </div>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex flex-wrap gap-2">
            {NODE_TYPES.map(type => (
              <button
                key={type.value}
                onClick={() => addNode(type.value)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                style={{ borderLeftColor: type.color, borderLeftWidth: '3px' }}
                title={`Add ${type.label} component`}
              >
                <Plus className="w-3 h-3" />
                {type.label}
              </button>
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-600">
          {connectMode ? (
            connectingFrom ? (
              <span className="font-medium text-blue-600">Click another node to create a connection →</span>
            ) : (
              <span>Click a node to start connecting, then click another node to finish</span>
            )
          ) : (
            <span>Drag nodes to reposition them • Click the Connect Mode button to create edges</span>
          )}
        </div>
      </div>
      
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative bg-white overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Connection preview line */}
          {connectingFrom && connectMode && (() => {
            const fromNode = nodes.find(n => n.id === connectingFrom)
            if (!fromNode) return null
            return (
              <line
                x1={fromNode.x + 64}
                y1={fromNode.y + 40}
                x2={mousePos.x}
                y2={mousePos.y}
                stroke="#3B82F6"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.6"
              />
            )
          })()}
          
          {/* Existing edges */}
          {edges.map(edge => {
            const fromNode = nodes.find(n => n.id === edge.fromId)
            const toNode = nodes.find(n => n.id === edge.toId)
            if (!fromNode || !toNode) return null
            
            return (
              <g key={edge.id}>
                <title>Click to delete edge</title>
                <line
                  x1={fromNode.x + 64}
                  y1={fromNode.y + 40}
                  x2={toNode.x + 64}
                  y2={toNode.y + 40}
                  stroke="#94A3B8"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <circle
                  cx={(fromNode.x + toNode.x) / 2 + 64}
                  cy={(fromNode.y + toNode.y) / 2 + 40}
                  r="12"
                  fill="white"
                  stroke="#EF4444"
                  strokeWidth="2"
                  className="pointer-events-auto cursor-pointer hover:fill-red-50"
                  onClick={() => deleteEdge(edge.id)}
                />
                <text
                  x={(fromNode.x + toNode.x) / 2 + 64}
                  y={(fromNode.y + toNode.y) / 2 + 40}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none text-xs fill-red-500 font-bold"
                >
                  ×
                </text>
              </g>
            )
          })}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#94A3B8" />
            </marker>
          </defs>
        </svg>
        
        {nodes.map(node => {
          const nodeType = NODE_TYPES.find(t => t.value === node.nodeType)
          return (
            <div
              key={node.id}
              className={`absolute w-32 p-3 rounded-lg border-2 transition-all ${
                connectMode ? 'cursor-pointer' : 'cursor-move'
              } ${
                selectedNode === node.id ? 'ring-2 ring-purple-500 shadow-lg' : 'shadow-sm hover:shadow-md'
              } ${connectingFrom === node.id ? 'ring-2 ring-blue-500 animate-pulse' : ''}`}
              style={{
                left: node.x,
                top: node.y,
                backgroundColor: 'white',
                borderColor: nodeType?.color || '#6B7280'
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
                if (!connectMode) {
                  startDrag(node.id, e)
                }
              }}
              onClick={(e) => {
                e.stopPropagation()
                handleNodeClick(node.id)
              }}
              title={connectMode ? 'Click to connect' : 'Drag to move'}
            >
              <div className="text-xs font-semibold mb-1" style={{ color: nodeType?.color }}>
                {node.nodeType}
              </div>
              <div className="text-sm truncate">{node.label}</div>
              {!connectMode && (
                <button
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNode(node.id)
                  }}
                  title="Delete node"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )
        })}
        
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-lg mb-2">Start building your architecture</p>
              <p className="text-sm">Add components from the toolbar above</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
