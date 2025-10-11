import { useCallback } from 'react'

interface ReportProgressOptions {
  content_type: string
  content_id: string
}

export function useReportProgress() {
  const report = useCallback(async (opts: ReportProgressOptions & { progress: any }) => {
    try {
      const res = await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_type: opts.content_type,
          content_id: opts.content_id,
          progress: opts.progress,
        })
      })

      return await res.json()
    } catch (err) {
      console.error('Report progress failed', err)
      return { error: 'failed' }
    }
  }, [])

  const fetchProgress = useCallback(async (content_type: string, contentId?: string) => {
    try {
      const params = new URLSearchParams({ type: content_type })
      if (contentId) params.set('contentId', contentId)
      const res = await fetch(`/api/user/progress?${params.toString()}`)
      return await res.json()
    } catch (err) {
      console.error('Fetch progress failed', err)
      return { error: 'failed' }
    }
  }, [])

  return { report, fetchProgress }
}
