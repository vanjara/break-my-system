'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Simulated retry wave data for visualization
function generateRetryWaveData() {
  const data = []
  const initialLoad = 5000 // normal load
  const spike = 15000 // concert ends
  
  // Time in seconds
  for (let t = 0; t <= 30; t++) {
    let requests = initialLoad
    let retries = 0
    
    if (t >= 5 && t < 8) {
      // Outage period
      requests = 0
      retries = 0
    } else if (t === 8) {
      // First retry wave after outage
      requests = spike
      retries = spike
    } else if (t === 10) {
      // Second retry wave (previous failures retry)
      requests = spike * 0.3
      retries = spike * 1.3
    } else if (t === 12) {
      // Third retry wave (compounding)
      requests = spike * 0.2
      retries = spike * 1.5
    } else if (t === 14) {
      // Peak of retry storm
      requests = spike * 0.1
      retries = spike * 1.8
    } else if (t > 14 && t <= 20) {
      // Gradual recovery
      const recovery = (t - 14) / 6
      requests = initialLoad * recovery
      retries = spike * (1.8 - recovery * 1.5)
    } else if (t > 20) {
      // Back to normal
      requests = initialLoad
      retries = 0
    }
    
    data.push({
      time: t,
      'New Requests': Math.max(0, Math.round(requests)),
      'Retry Traffic': Math.max(0, Math.round(retries)),
      'Total Load': Math.max(0, Math.round(requests + retries))
    })
  }
  
  return data
}

export default function RetryWaveViz() {
  const data = generateRetryWaveData()
  
  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Retry Storm Visualization</h3>
        <p className="text-sm text-gray-600">
          Notice how a 3-second outage at t=5s triggers cascading retry waves that amplify the load
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            label={{ value: 'Requests/sec', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="New Requests"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Retry Traffic"
            stroke="#EF4444"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Total Load"
            stroke="#8B5CF6"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <div className="font-semibold text-blue-900">New Requests</div>
          <div className="text-blue-700">Normal user traffic pattern</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <div className="font-semibold text-red-900">Retry Traffic</div>
          <div className="text-red-700">Amplified retry waves</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded p-3">
          <div className="font-semibold text-purple-900">Total Load</div>
          <div className="text-purple-700">What the server experiences</div>
        </div>
      </div>
    </div>
  )
}
