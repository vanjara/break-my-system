import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getAIInterviewerResponse } from '@/lib/demo-interviewer'
import { ExerciseStage } from '@/lib/exercises/types'

const MessageSchema = z.object({
  content: z.string(),
  role: z.enum(['user', 'assistant'])
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params
  try {
    const body = await request.json()
    const { content, role } = MessageSchema.parse(body)
    
    // Get session with messages
    const session = await prisma.exerciseSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }
    
    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        sessionId: sessionId,
        role,
        content
      }
    })
    
    // Update last activity
    await prisma.exerciseSession.update({
      where: { id: sessionId },
      data: { lastActivity: new Date() }
    })
    
    // If user message, generate interviewer response
    if (role === 'user') {
      const conversationHistory = session.messages.map(m => ({
        role: m.role,
        content: m.content
      }))
      
      const interviewerResponse = await getAIInterviewerResponse(
        session.exerciseId,
        session.stage as ExerciseStage,
        conversationHistory,
        content
      )
      
      // Save interviewer message
      const assistantMessage = await prisma.message.create({
        data: {
          sessionId: sessionId,
          role: 'assistant',
          content: interviewerResponse.message,
          metadata: JSON.stringify({
            reasoningSignalsDetected: interviewerResponse.reasoningSignalsDetected,
            misconceptionsDetected: interviewerResponse.misconceptionsDetected,
            readinessScore: interviewerResponse.readinessScore,
            suggestedNextAction: interviewerResponse.suggestedNextAction
          })
        }
      })
      
      return NextResponse.json({
        userMessage,
        assistantMessage,
        metadata: {
          reasoningSignalsDetected: interviewerResponse.reasoningSignalsDetected,
          misconceptionsDetected: interviewerResponse.misconceptionsDetected,
          readinessScore: interviewerResponse.readinessScore,
          suggestedNextAction: interviewerResponse.suggestedNextAction
        }
      })
    }
    
    return NextResponse.json({ userMessage })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}
