'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Send, Lightbulb, ArrowRight, Menu, X, TrendingUp } from 'lucide-react'
import DiagramEditor, { DiagramNode, DiagramEdge } from '@/components/DiagramEditor'
import RetryWaveViz from '@/components/RetryWaveViz'
import { getExerciseById } from '@/lib/exercises'
import { getStageDescription, getNextStage } from '@/lib/state-machine'

interface Message {
  id: string
  role: string
  content: string
  metadata?: string
}

interface Session {
  id: string
  exerciseId: string
  stage: string
  status: string
  exercise: {
    id: string
    title: string
    openingStory: string
  }
  messages: Message[]
  diagrams: DiagramNode[]
  edges: DiagramEdge[]
}

export default function WorkspacePage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params?.sessionId as string
  
  const [session, setSession] = useState<Session | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [nodes, setNodes] = useState<DiagramNode[]>([])
  const [edges, setEdges] = useState<DiagramEdge[]>([])
  const [savingDiagram, setSavingDiagram] = useState(false)
  const [activeTab, setActiveTab] = useState<'scenario' | 'conversation' | 'diagram'>('scenario')
  const [showHints, setShowHints] = useState(false)
  const [currentHintLevel, setCurrentHintLevel] = useState(1)
  const [showRetryViz, setShowRetryViz] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    loadSession()
  }, [sessionId])
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.messages])
  
  async function loadSession() {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`)
      const data = await res.json()
      setSession(data)
      setNodes(data.diagrams || [])
      setEdges(data.edges || [])
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  }
  
  async function sendMessage() {
    if (!input.trim() || sending) return
    
    setSending(true)
    try {
      await fetch(`/api/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: input,
          role: 'user'
        })
      })
      
      setInput('')
      await loadSession()
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }
  
  async function advanceStage() {
    try {
      await fetch(`/api/sessions/${sessionId}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'advance' })
      })
      
      await loadSession()
    } catch (error) {
      console.error('Failed to advance stage:', error)
    }
  }
  
  async function saveDiagram(newNodes: DiagramNode[], newEdges: DiagramEdge[]) {
    setNodes(newNodes)
    setEdges(newEdges)
    
    setSavingDiagram(true)
    try {
      await fetch(`/api/sessions/${sessionId}/diagram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: newNodes,
          edges: newEdges
        })
      })
    } catch (error) {
      console.error('Failed to save diagram:', error)
    } finally {
      setSavingDiagram(false)
    }
  }
  
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }
  
  const exercise = getExerciseById(session.exerciseId)
  const canAdvance = getNextStage(session.stage as any) !== null
  const isRetryArmy = session.exerciseId === 'retry-army'
  const showRetryStorm = isRetryArmy && (session.stage === 'FAILURE_INJECTION' || session.stage === 'ADAPTATION')
  
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold">{session.exercise.title}</h1>
            <p className="text-sm text-gray-600">{getStageDescription(session.stage as any)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canAdvance && (
            <button
              onClick={advanceStage}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded hover:bg-accent/90"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>
      
      {/* Mobile tabs */}
      <div className="md:hidden bg-white border-b border-gray-200 flex">
        <button
          onClick={() => setActiveTab('scenario')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'scenario' ? 'text-accent border-b-2 border-accent' : 'text-gray-600'
          }`}
        >
          Scenario
        </button>
        <button
          onClick={() => setActiveTab('conversation')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'conversation' ? 'text-accent border-b-2 border-accent' : 'text-gray-600'
          }`}
        >
          Conversation
        </button>
        <button
          onClick={() => setActiveTab('diagram')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'diagram' ? 'text-accent border-b-2 border-accent' : 'text-gray-600'
          }`}
        >
          Diagram
        </button>
      </div>
      
      {/* Main content - 3 panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Scenario */}
        <div className={`w-full md:w-1/4 border-r border-gray-200 overflow-y-auto p-4 ${
          activeTab === 'scenario' ? 'block' : 'hidden md:block'
        }`}>
          <h2 className="font-semibold mb-3">Scenario</h2>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-sm text-gray-700">
              {session.exercise.openingStory}
            </p>
          </div>
          
          {/* Retry Wave Visualization - prominent for Retry Army during failure stages */}
          {showRetryStorm && (
            <div className="mt-6 border-2 border-red-400 rounded-lg bg-red-50 p-4 animate-pulse-slow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-sm text-red-900">Retry Storm Visualization</h3>
                </div>
                <button
                  onClick={() => setShowRetryViz(!showRetryViz)}
                  className="text-xs text-red-700 hover:text-red-900 font-medium"
                >
                  {showRetryViz ? 'Hide' : 'Show'}
                </button>
              </div>
              {showRetryViz && (
                <div className="bg-white rounded p-2 border border-red-200">
                  <RetryWaveViz />
                </div>
              )}
              <p className="text-xs text-red-800 mt-2">
                ⚠️ This visualization shows how retry attempts can create cascading waves of traffic. Watch how each failed request spawns retries!
              </p>
            </div>
          )}
          
          {exercise && (
            <div className="mt-6">
              <h3 className="font-semibold text-sm mb-2">Quick Questions</h3>
              <div className="space-y-2">
                {exercise.clarifyingQuestionChips.slice(0, 3).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="w-full text-left text-xs px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Center panel - Conversation */}
        <div className={`w-full md:w-1/2 flex flex-col ${
          activeTab === 'conversation' ? 'block' : 'hidden md:flex'
        }`}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {session.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-accent text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Hints button */}
          {exercise && exercise.hints.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200">
              <button
                onClick={() => setShowHints(!showHints)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <Lightbulb className="w-4 h-4" />
                {showHints ? 'Hide' : 'Show'} Hints
              </button>
              
              {showHints && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-2">
                    {[1, 2, 3].map(level => (
                      <button
                        key={level}
                        onClick={() => setCurrentHintLevel(level)}
                        className={`px-3 py-1 text-xs rounded ${
                          currentHintLevel === level
                            ? 'bg-accent text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        Hint {level}
                      </button>
                    ))}
                  </div>
                  <div className="text-sm bg-blue-50 border border-blue-200 rounded p-3">
                    {exercise.hints.find(h => h.level === currentHintLevel)?.content}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your response..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Right panel - Diagram */}
        <div className={`w-full md:w-1/4 border-l border-gray-200 flex flex-col ${
          activeTab === 'diagram' ? 'block' : 'hidden md:flex'
        }`}>
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold">Architecture</h2>
            {savingDiagram && <span className="text-xs text-gray-500">Saving...</span>}
          </div>
          <div className="flex-1 overflow-hidden">
            <DiagramEditor
              nodes={nodes}
              edges={edges}
              onChange={saveDiagram}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
