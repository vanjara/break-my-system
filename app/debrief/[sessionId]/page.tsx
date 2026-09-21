'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import RetryWaveViz from '@/components/RetryWaveViz'
import { getExerciseById } from '@/lib/exercises'

interface Session {
  id: string
  exerciseId: string
  exercise: {
    title: string
  }
}

export default function DebriefPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadSession()
  }, [sessionId])
  
  async function loadSession() {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`)
      const data = await res.json()
      setSession(data)
    } catch (error) {
      console.error('Failed to load session:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }
  
  const exercise = getExerciseById(session.exerciseId)
  if (!exercise) return null
  
  // Mock scores for demo (in real app, these would be calculated from session data)
  const scores = {
    clarify: 4,
    bottleneck: 4,
    adapt: 3,
    tradeoffs: 4,
    software: 5
  }
  
  const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / 5
  
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold">{session.exercise.title} - Debrief</h1>
            <p className="text-sm text-gray-600">Review your performance</p>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Overall Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Exercise Complete!</h2>
            <div className="text-right">
              <div className="text-3xl font-bold text-accent">{avgScore.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
          </div>
          <p className="text-gray-700">
            You've completed {session.exercise.title}. Here's how you performed across key areas:
          </p>
        </div>
        
        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ScoreCard
            title="Clarifying Questions"
            score={scores.clarify}
            feedback={exercise.debriefRubric.clarifySignals[0]}
          />
          <ScoreCard
            title="Bottleneck Analysis"
            score={scores.bottleneck}
            feedback={exercise.debriefRubric.bottleneckSignals[0]}
          />
          <ScoreCard
            title="Design Adaptation"
            score={scores.adapt}
            feedback={exercise.debriefRubric.adaptSignals[0]}
          />
          <ScoreCard
            title="Tradeoff Discussion"
            score={scores.tradeoffs}
            feedback={exercise.debriefRubric.tradeoffSignals[0]}
          />
          <ScoreCard
            title="Software Translation"
            score={scores.software}
            feedback={exercise.debriefRubric.softwareSignals[0]}
          />
        </div>
        
        {/* Retry Army Special Visualization */}
        {exercise.id === 'retry-army' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <RetryWaveViz />
          </div>
        )}
        
        {/* Concepts Learned */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Mental Models Unlocked</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-accent pl-4">
              <h4 className="font-semibold text-lg mb-2">{exercise.conceptReveal.title}</h4>
              <p className="text-gray-700 mb-2">{exercise.conceptReveal.whyItMatters}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {exercise.reasoningSignals.map((signal, i) => (
                <div key={i} className="bg-blue-50 px-3 py-2 rounded text-sm">
                  {signal}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Model Answer */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Model Answer</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{exercise.debriefRubric.modelAnswer}</p>
        </div>
        
        {/* Transfer Question */}
        <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-3">Transfer Challenge</h3>
          <p className="text-gray-800 mb-4">{exercise.debriefRubric.transferQuestion}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-accent text-white px-6 py-2 rounded hover:bg-accent/90"
          >
            Try Another Exercise
          </button>
        </div>
        
        {/* Common Misconceptions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4">Common Misconceptions</h3>
          <ul className="space-y-2">
            {exercise.debriefRubric.commonMisconceptions.map((misconception, i) => (
              <li key={i} className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{misconception}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}

function ScoreCard({ title, score, feedback }: { title: string; score: number; feedback: string }) {
  const color = score >= 4 ? 'text-green-600' : score >= 3 ? 'text-yellow-600' : 'text-red-600'
  const bgColor = score >= 4 ? 'bg-green-50' : score >= 3 ? 'bg-yellow-50' : 'bg-red-50'
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <div className={`${bgColor} ${color} px-3 py-1 rounded-full font-bold`}>
          {score}/5
        </div>
      </div>
      <p className="text-sm text-gray-600">{feedback}</p>
    </div>
  )
}
