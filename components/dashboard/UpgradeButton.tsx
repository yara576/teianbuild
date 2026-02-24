'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      alert('エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={loading}
      className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer font-medium"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          処理中...
        </span>
      ) : (
        '✨ Pro にアップグレード ¥980/月'
      )}
    </Button>
  )
}
