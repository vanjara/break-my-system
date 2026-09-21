import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { ExerciseStage } from '@/lib/exercises/types'
import { getNextStage, isStageComplete } from '@/lib/state-machine'
import { getExerciseById } from '@/lib/exercises'

const UpdateStageSchema = z.object({
  action: z.enum(['advance'])
})

function buildStageTransitionMessage(stage: ExerciseStage, exercise: any): string {
  const stageKey = stage.toLowerCase().replace(/_/g, '')
  const stagePrompt = exercise.stagePrompts?.[stageKey] || ''
  
  switch (stage) {
    case 'SCENARIO':
      return `## Welcome to ${exercise.title}\n\n${exercise.openingStory}\n\n${stagePrompt}`
    
    case 'CLARIFY':
      return `## Clarifying Questions\n\n${stagePrompt}\n\nFeel free to ask about:\n${exercise.clarifyingQuestionChips?.slice(0, 3).map((q: string) => `- ${q}`).join('\n') || ''}`
    
    case 'INITIAL_DESIGN':
      return `## Initial Design\n\n${stagePrompt}\n\nConsider the constraints: ${exercise.constraints}`
    
    case 'FAILURE_INJECTION':
      const failure = exercise.failureScenarios?.[0]
      if (failure) {
        return `## ⚠️ Failure Scenario\n\n**${failure.trigger}**\n\n${failure.description}\n\n**Impact:** ${failure.impact}\n\n${stagePrompt}`
      }
      return `## Failure Injection\n\n${stagePrompt}`
    
    case 'ADAPTATION':
      return `## Adaptation\n\n${stagePrompt}\n\nYour design is under stress. How do you evolve it?`
    
    case 'CONCEPT_REVEAL':
      return `## 💡 ${exercise.conceptReveal?.title || 'Concept Reveal'}\n\n${exercise.conceptReveal?.explanation || stagePrompt}\n\n**Why it matters:** ${exercise.conceptReveal?.whyItMatters || ''}`
    
    case 'SOFTWARE_TRANSLATION':
      return `## Software Translation\n\n${stagePrompt}\n\nLet's map what you experienced to real software patterns.`
    
    case 'DEBRIEF':
      return `## Debrief\n\n${stagePrompt}\n\nYou've completed the core exercise. Let's reflect on what you learned.`
    
    case 'COMPLETE':
      return `## ✅ Exercise Complete\n\nWell done! You've worked through all stages of this exercise.`
    
    default:
      return stagePrompt || `Moving to ${stage} stage.`
  }
}

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
      
      // Get exercise to pull stage-specific content
      const exercise = getExerciseById(session.exerciseId)
      if (!exercise) {
        return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
      }
      
      // Build a strong stage transition message
      const transitionMessage = buildStageTransitionMessage(nextStage, exercise)
      
      const updatedSession = await prisma.exerciseSession.update({
        where: { id: sessionId },
        data: {
          stage: nextStage,
          status: isStageComplete(nextStage) ? 'completed' : 'in_progress',
          completedAt: isStageComplete(nextStage) ? new Date() : null,
          lastActivity: new Date()
        }
      })
      
      // Create interviewer message announcing the new stage
      await prisma.message.create({
        data: {
          sessionId: session.id,
          role: 'interviewer',
          content: transitionMessage
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
