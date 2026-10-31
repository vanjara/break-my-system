import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const CreateSessionSchema = z.object({
  userId: z.string(),
  exerciseId: z.string()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, exerciseId } = CreateSessionSchema.parse(body)
    
    // Check for existing incomplete session
    const existingSession = await prisma.exerciseSession.findFirst({
      where: {
        userId,
        exerciseId,
        status: { in: ['in_progress', 'started'] }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        },
        diagrams: {
          include: {
            edgesFrom: true,
            edgesTo: true
          }
        }
      }
    })
    
    if (existingSession) {
      return NextResponse.json(existingSession)
    }
    
    // Create new session
    const session = await prisma.exerciseSession.create({
      data: {
        userId,
        exerciseId,
        stage: 'SCENARIO',
        status: 'started'
      },
      include: {
        exercise: true
      }
    })
    
    return NextResponse.json(session)
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}
