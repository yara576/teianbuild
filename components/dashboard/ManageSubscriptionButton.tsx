'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)

  const handleManage = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
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
      onClick={handleManage}
      disabled={loading}
      variant="outline"
      className="cursor-pointer text-sm"
    >
      {loading ? '処理中...' : 'サブスク管理'}
    </Button>
  )
}
