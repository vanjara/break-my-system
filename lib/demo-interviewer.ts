import { z } from 'zod'
import { ExerciseStage } from './exercises/types'
import { getExerciseById } from './exercises'

export const InterviewerResponseSchema = z.object({
  message: z.string(),
  reasoningSignalsDetected: z.array(z.string()),
  misconceptionsDetected: z.array(z.string()),
  readinessScore: z.number().min(0).max(100),
  suggestedNextAction: z.enum(['continue', 'hint', 'advance'])
})

export type InterviewerResponse = z.infer<typeof InterviewerResponseSchema>

export class DemoInterviewer {
  private exerciseId: string
  private stage: ExerciseStage
  
  constructor(exerciseId: string, stage: ExerciseStage) {
    this.exerciseId = exerciseId
    this.stage = stage
  }
  
  async processUserInput(input: string): Promise<InterviewerResponse> {
    const exercise = getExerciseById(this.exerciseId)
    if (!exercise) {
      throw new Error(`Exercise ${this.exerciseId} not found`)
    }
    
    // Demo interviewer provides deterministic, helpful responses
    const responses = this.getStageResponses(input.toLowerCase())
    
    return {
      message: responses.message,
      reasoningSignalsDetected: this.detectReasoningSignals(input, exercise.reasoningSignals),
      misconceptionsDetected: this.detectMisconceptions(input, exercise.misconceptions),
      readinessScore: responses.readinessScore,
      suggestedNextAction: responses.suggestedNextAction
    }
  }
  
  private getStageResponses(input: string): Omit<InterviewerResponse, 'reasoningSignalsDetected' | 'misconceptionsDetected'> {
    // Check for readiness signals
    if (input.includes('ready') || input.includes('continue') || input.includes('next')) {
      return {
        message: "Great! Let's move forward.",
        readinessScore: 85,
        suggestedNextAction: 'advance'
      }
    }
    
    // Check for hint requests
    if (input.includes('hint') || input.includes('help') || input.includes('stuck')) {
      return {
        message: "I can provide a hint if you'd like. Would you like me to share one?",
        readinessScore: 40,
        suggestedNextAction: 'hint'
      }
    }
    
    // Generic encouraging response based on stage
    const stageResponses: Record<ExerciseStage, string> = {
      'SCENARIO': "Interesting observation. What else do you notice about this situation?",
      'CLARIFY': "Good question. Understanding the constraints is important. What else would help you?",
      'INITIAL_DESIGN': "I see your approach. Can you walk me through how this would handle the peak load scenario?",
      'FAILURE_INJECTION': "Now we have a new challenge. How does your design handle this failure mode?",
      'ADAPTATION': "Interesting solution. What tradeoffs are you making here?",
      'CONCEPT_REVEAL': "These concepts connect to what you experienced. Do you see the parallels?",
      'SOFTWARE_TRANSLATION': "Good connection. How would you implement this in a real system?",
      'DEBRIEF': "Let's reflect on what you've learned.",
      'COMPLETE': "Well done!"
    }
    
    // Analyze input for key concepts
    const hasCapacityThinking = input.includes('capacity') || input.includes('throughput') || input.includes('limit')
    const hasBottleneckThinking = input.includes('bottleneck') || input.includes('constraint') || input.includes('slowest')
    const hasFailureThinking = input.includes('fail') || input.includes('timeout') || input.includes('error')
    const hasScalingThinking = input.includes('scale') || input.includes('horizontal') || input.includes('vertical')
    
    let readinessScore = 50
    if (hasCapacityThinking) readinessScore += 10
    if (hasBottleneckThinking) readinessScore += 10
    if (hasFailureThinking) readinessScore += 10
    if (hasScalingThinking) readinessScore += 10
    
    return {
      message: stageResponses[this.stage],
      readinessScore: Math.min(readinessScore, 95),
      suggestedNextAction: readinessScore >= 70 ? 'advance' : 'continue'
    }
  }
  
  private detectReasoningSignals(input: string, signals: string[]): string[] {
    const lowerInput = input.toLowerCase()
    return signals.filter(signal => 
      lowerInput.includes(signal.toLowerCase().replace(/-/g, ' '))
    )
  }
  
  private detectMisconceptions(input: string, misconceptions: string[]): string[] {
    const lowerInput = input.toLowerCase()
    return misconceptions.filter(misconception =>
      lowerInput.includes(misconception.toLowerCase().replace(/-/g, ' '))
    )
  }
  
  generateHint(level: number): string {
    const exercise = getExerciseById(this.exerciseId)
    if (!exercise) return "No hints available."
    
    const hint = exercise.hints.find(h => h.level === level)
    return hint ? hint.content : "No more hints available."
  }
}

// AI Interviewer (when OpenAI key is available)
export async function getAIInterviewerResponse(
  exerciseId: string,
  stage: ExerciseStage,
  conversationHistory: Array<{ role: string; content: string }>,
  userInput: string
): Promise<InterviewerResponse> {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    // Fall back to demo interviewer
    const demo = new DemoInterviewer(exerciseId, stage)
    return demo.processUserInput(userInput)
  }
  
  const exercise = getExerciseById(exerciseId)
  if (!exercise) {
    throw new Error(`Exercise ${exerciseId} not found`)
  }
  
  try {
    const systemPrompt = `You are an insightful system design interviewer for the exercise "${exercise.title}". 
    
Current stage: ${stage}
    
Your role:
- Ask probing questions that reveal the learner's reasoning
- Challenge assumptions gently
- Detect reasoning signals: ${exercise.reasoningSignals.join(', ')}
- Spot common misconceptions: ${exercise.misconceptions.join(', ')}
- Keep responses short (2-3 sentences max)
- Don't give away answers early
- Build on their ideas before introducing concepts
- Be curious and supportive, not pedantic

Respond with a JSON object:
{
  "message": "your response",
  "reasoningSignalsDetected": ["list", "of", "signals"],
  "misconceptionsDetected": ["list", "of", "misconceptions"],
  "readinessScore": 0-100,
  "suggestedNextAction": "continue" | "hint" | "advance"
}`
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: userInput }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 300
      })
    })
    
    if (!response.ok) {
      throw new Error('OpenAI API error')
    }
    
    const data = await response.json()
    const content = data.choices[0].message.content
    const parsed = JSON.parse(content)
    
    return InterviewerResponseSchema.parse(parsed)
  } catch (error) {
    console.error('AI Interviewer error, falling back to Demo:', error)
    const demo = new DemoInterviewer(exerciseId, stage)
    return demo.processUserInput(userInput)
  }
}
