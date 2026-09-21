import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const DiagramNodeSchema = z.object({
  id: z.string(),
  nodeType: z.string(),
  label: z.string(),
  x: z.number(),
  y: z.number()
})

const DiagramEdgeSchema = z.object({
  id: z.string(),
  fromId: z.string(),
  toId: z.string(),
  label: z.string().optional()
})

const UpdateDiagramSchema = z.object({
  nodes: z.array(DiagramNodeSchema),
  edges: z.array(DiagramEdgeSchema)
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  try {
    const body = await request.json()
    const { nodes, edges } = UpdateDiagramSchema.parse(body)
    
    // Delete existing diagram elements
    await prisma.diagramEdge.deleteMany({
      where: { sessionId: sessionId }
    })
    await prisma.diagramNode.deleteMany({
      where: { sessionId: sessionId }
    })
    
    // Create new nodes
    await Promise.all(
      nodes.map(node =>
        prisma.diagramNode.create({
          data: {
            id: node.id,
            sessionId: sessionId,
            nodeType: node.nodeType,
            label: node.label,
            x: node.x,
            y: node.y
          }
        })
      )
    )
    
    // Create new edges
    await Promise.all(
      edges.map(edge =>
        prisma.diagramEdge.create({
          data: {
            id: edge.id,
            sessionId: sessionId,
            fromId: edge.fromId,
            toId: edge.toId,
            label: edge.label || ''
          }
        })
      )
    )
    
    // Update last activity
    await prisma.exerciseSession.update({
      where: { id: sessionId },
      data: { lastActivity: new Date() }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating diagram:', error)
    return NextResponse.json({ error: 'Failed to update diagram' }, { status: 500 })
  }
}
