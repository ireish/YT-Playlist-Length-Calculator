'use client'

import React, { useState } from 'react'
// Shadcn UI components
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

// Helper to convert seconds to HH:MM:SS
function formatSecondsToHMS(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function HomePage() {
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [totalSeconds, setTotalSeconds] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // For slider, we track single value array [speed]
  const [speed, setSpeed] = useState([1])

  const handleCalculate = async () => {
    setError(null)
    setTotalSeconds(null)

    // Basic client-side validation for YouTube playlist
    if (!playlistUrl.includes('list=')) {
      setError('Please enter a valid YouTube playlist link.')
      return
    }

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playlistUrl }),
      })
      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        setTotalSeconds(data.totalDurationSeconds)
      }
    } catch (err: any) {
      setError('Something went wrong. Please try again.')
    }
  }

  // Compute total time at current speed
  const getTimeAtSpeed = (baseSeconds: number, playbackSpeed: number) => {
    const newTime = baseSeconds / playbackSpeed
    return formatSecondsToHMS(Math.round(newTime))
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-xl p-4 text-center space-y-6">
        <h1 className="text-3xl font-bold mb-4" style={{ color: '#F16B34' }}>
          YouTube Playlist Time Calculator
        </h1>

        <div className="flex gap-2 justify-center">
          <Input
            type="text"
            placeholder="Enter YouTube playlist link"
            value={playlistUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlaylistUrl(e.target.value)}
            className="border border-gray-700 bg-black text-white placeholder-gray-500 w-full"
          />

          <Button onClick={handleCalculate} className="bg-[#F16B34] hover:bg-red-600">
            Calculate
          </Button>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        {totalSeconds !== null && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl mb-2" style={{ color: '#F16B34' }}>Total Playlist Duration</h2>
              <p className="text-2xl font-semibold">
                {formatSecondsToHMS(totalSeconds)}
              </p>
            </div>

            <div>
              <h2 className="text-xl mb-2" style={{ color: '#F16B34' }}>Choose Playback Speed</h2>
              <Slider
                // Shadcn UI Slider values are arrays
                value={speed}
                onValueChange={setSpeed}
                min={1}
                max={2}
                step={0.05}
                className="max-w-md mx-auto"
              />
              <p className="mt-2">
                Current Speed: <span className="font-semibold">{speed[0].toFixed(2)}x</span>
              </p>
            </div>

            <div className="mt-4">
              <h3 className="text-lg" style={{ color: '#F16B34' }}>Total Time at {speed[0].toFixed(2)}x Speed</h3>
              <p className="text-2xl font-bold">
                {getTimeAtSpeed(totalSeconds, speed[0])}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
