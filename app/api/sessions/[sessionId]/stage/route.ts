import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { ExerciseStage } from '@/lib/exercises/types'
import { getNextStage, isStageComplete } from '@/lib/state-machine'

const UpdateStageSchema = z.object({
  action: z.enum(['advance'])
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  try {
    const body = await request.json()
    const { action } = UpdateStageSchema.parse(body)
    
    const session = await prisma.exerciseSession.findUnique({
      where: { id: sessionId }
    })
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    
    if (action === 'advance') {
      const currentStage = session.stage as ExerciseStage
      const nextStage = getNextStage(currentStage)
      
      if (!nextStage) {
        return NextResponse.json({ error: 'Cannot advance from final stage' }, { status: 400 })
      }
      
      const updatedSession = await prisma.exerciseSession.update({
        where: { id: sessionId },
        data: {
          stage: nextStage,
          status: isStageComplete(nextStage) ? 'completed' : 'in_progress',
          completedAt: isStageComplete(nextStage) ? new Date() : null,
          lastActivity: new Date()
        }
      })
      
      return NextResponse.json(updatedSession)
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating stage:', error)
    return NextResponse.json({ error: 'Failed to update stage' }, { status: 500 })
  }
}
