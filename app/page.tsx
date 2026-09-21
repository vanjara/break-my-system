'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Zap, TrendingUp } from 'lucide-react'

interface Exercise {
  id: string
  title: string
  setting: string
  conceptsPreview: string
  duration: number
  ordinal: number
}

interface ProgressRecord {
  exerciseId: string
  completed: boolean
  attempts: number
}

interface SessionData {
  exerciseId: string
  status: string
}

export default function HomePage() {
  const router = useRouter()
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [progress, setProgress] = useState<Record<string, ProgressRecord>>({})
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  
  const GUEST_USER_ID = 'guest-user'
  
  useEffect(() => {
    async function loadData() {
      try {
        const [exercisesRes, progressRes] = await Promise.all([
          fetch('/api/exercises'),
          fetch(`/api/progress?userId=${GUEST_USER_ID}`)
        ])
        
        const exercisesData = await exercisesRes.json()
        const progressData = await progressRes.json()
        
        setExercises(exercisesData)
        
        const progressMap: Record<string, ProgressRecord> = {}
        progressData.progressRecords.forEach((pr: ProgressRecord) => {
          progressMap[pr.exerciseId] = pr
        })
        setProgress(progressMap)
        setSessions(progressData.sessions)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  async function startExercise(exerciseId: string) {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: GUEST_USER_ID,
          exerciseId
        })
      })
      
      const session = await res.json()
      router.push(`/workspace/${session.id}`)
    } catch (error) {
      console.error('Failed to start exercise:', error)
    }
  }
  
  const completedCount = Object.values(progress).filter(p => p.completed).length
  const attemptedCount = Object.values(progress).length
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Break My System</h1>
          <p className="mt-2 text-lg text-gray-600">Build it. Break it. Understand it.</p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Summary */}
        {attemptedCount > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-accent mr-3" />
                <div>
                  <div className="text-2xl font-bold">{attemptedCount}</div>
                  <div className="text-sm text-gray-600">Attempted</div>
                </div>
              </div>
              <div className="flex items-center">
                <Zap className="w-8 h-8 text-secondary mr-3" />
                <div>
                  <div className="text-2xl font-bold">{completedCount}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-accent mr-3" />
                <div>
                  <div className="text-2xl font-bold">{completedCount * 3}</div>
                  <div className="text-sm text-gray-600">Concepts Unlocked</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Exercise Cards */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Exercises</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => {
              const exerciseProgress = progress[exercise.id]
              const hasInProgressSession = sessions.some(
                s => s.exerciseId === exercise.id && s.status !== 'completed'
              )
              
              return (
                <div
                  key={exercise.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {exercise.title}
                      </h3>
                      {exerciseProgress?.completed && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Completed
                        </span>
                      )}
                      {hasInProgressSession && !exerciseProgress?.completed && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          In Progress
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{exercise.setting}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{exercise.duration} min</span>
                      <span className="text-accent">
                        {exercise.conceptsPreview}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => startExercise(exercise.id)}
                      className="w-full bg-accent hover:bg-accent/90 text-white font-medium py-2 px-4 rounded transition-colors"
                    >
                      {hasInProgressSession ? 'Continue' : exerciseProgress ? 'Try Again' : 'Start'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Info Section */}
        <div className="mt-12 bg-secondary/5 rounded-lg p-8">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-accent font-bold text-lg mb-2">1. Experience</div>
              <p className="text-sm text-gray-700">
                Start with a real-world scenario you can relate to
              </p>
            </div>
            <div>
              <div className="text-accent font-bold text-lg mb-2">2. Design</div>
              <p className="text-sm text-gray-700">
                Think through how you'd solve it before technical jargon
              </p>
            </div>
            <div>
              <div className="text-accent font-bold text-lg mb-2">3. Break</div>
              <p className="text-sm text-gray-700">
                Watch your solution face realistic failures and constraints
              </p>
            </div>
            <div>
              <div className="text-accent font-bold text-lg mb-2">4. Understand</div>
              <p className="text-sm text-gray-700">
                Connect your insights to formal system design patterns
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
