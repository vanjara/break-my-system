import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await prisma.exerciseSession.findUnique({
      where: { id: params.sessionId },
      include: {
        exercise: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        diagrams: {
          include: {
            edgesFrom: true,
            edgesTo: true
          }
        },
        edges: true,
        debrief: true
      }
    })
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    
    return NextResponse.json(session)
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 })
  }
}
