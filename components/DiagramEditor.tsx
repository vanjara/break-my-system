'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'

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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  function addNode(nodeType: string) {
    const newNode: DiagramNode = {
      id: `node-${Date.now()}`,
      nodeType,
      label: NODE_TYPES.find(t => t.value === nodeType)?.label || nodeType,
      x: Math.random() * 300 + 50,
      y: Math.random() * 200 + 50
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
    if (!draggingNode || !canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - dragOffset.x
    const y = e.clientY - rect.top - dragOffset.y
    
    const newNodes = nodes.map(n =>
      n.id === draggingNode ? { ...n, x, y } : n
    )
    onChange(newNodes, edges)
  }
  
  function handleMouseUp() {
    setDraggingNode(null)
  }
  
  function startConnection(nodeId: string) {
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
  }
  
  function deleteEdge(edgeId: string) {
    const newEdges = edges.filter(e => e.id !== edgeId)
    onChange(nodes, newEdges)
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-3">
        <div className="flex flex-wrap gap-2 mb-3">
          {NODE_TYPES.map(type => (
            <button
              key={type.value}
              onClick={() => addNode(type.value)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
              style={{ borderLeftColor: type.color, borderLeftWidth: '3px' }}
            >
              <Plus className="w-3 h-3" />
              {type.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-600">
          {connectingFrom
            ? 'Click another node to connect'
            : 'Click nodes to connect them, drag to move'}
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
          {edges.map(edge => {
            const fromNode = nodes.find(n => n.id === edge.fromId)
            const toNode = nodes.find(n => n.id === edge.toId)
            if (!fromNode || !toNode) return null
            
            return (
              <g key={edge.id}>
                <line
                  x1={fromNode.x + 60}
                  y1={fromNode.y + 30}
                  x2={toNode.x + 60}
                  y2={toNode.y + 30}
                  stroke="#94A3B8"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                <circle
                  cx={(fromNode.x + toNode.x) / 2 + 60}
                  cy={(fromNode.y + toNode.y) / 2 + 30}
                  r="8"
                  fill="white"
                  stroke="#94A3B8"
                  strokeWidth="2"
                  className="pointer-events-auto cursor-pointer"
                  onClick={() => deleteEdge(edge.id)}
                />
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
              className={`absolute w-32 p-3 rounded-lg border-2 cursor-move transition-shadow ${
                selectedNode === node.id ? 'ring-2 ring-accent shadow-lg' : 'shadow-sm'
              } ${connectingFrom === node.id ? 'ring-2 ring-blue-500' : ''}`}
              style={{
                left: node.x,
                top: node.y,
                backgroundColor: 'white',
                borderColor: nodeType?.color || '#6B7280'
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
                startDrag(node.id, e)
                setSelectedNode(node.id)
              }}
              onClick={(e) => {
                e.stopPropagation()
                if (e.shiftKey) {
                  startConnection(node.id)
                }
              }}
            >
              <div className="text-xs font-semibold mb-1" style={{ color: nodeType?.color }}>
                {node.nodeType}
              </div>
              <div className="text-sm">{node.label}</div>
              <button
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteNode(node.id)
                }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
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
