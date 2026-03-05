'use client'

import { cn } from '@/lib/utils'

interface Thread {
  id: string
  subject: string | null
  status: string
  last_message_at: string | null
  last_message_preview: string | null
  patient: { first_name: string | null; last_name: string | null; email: string } | null
}

interface ThreadListProps {
  threads: Thread[]
  selectedThreadId: string | null
  onSelect: (threadId: string) => void
}

export function ThreadList({ threads, selectedThreadId, onSelect }: ThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No message threads yet.
      </div>
    )
  }

  return (
    <div className="divide-y">
      {threads.map((thread) => {
        const patientName = thread.patient
          ? `${thread.patient.first_name ?? ''} ${thread.patient.last_name ?? ''}`.trim() || thread.patient.email
          : 'Unknown'

        return (
          <button
            key={thread.id}
            className={cn(
              'w-full text-left p-4 hover:bg-accent/50 transition-colors',
              selectedThreadId === thread.id && 'bg-accent'
            )}
            onClick={() => onSelect(thread.id)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{patientName}</p>
                {thread.subject && (
                  <p className="text-xs text-muted-foreground truncate">{thread.subject}</p>
                )}
                {thread.last_message_preview && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {thread.last_message_preview}
                  </p>
                )}
              </div>
              {thread.last_message_at && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(thread.last_message_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
