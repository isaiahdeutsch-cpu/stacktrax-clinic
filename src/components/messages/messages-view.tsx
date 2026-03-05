'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ThreadList } from '@/components/messages/thread-list'
import { ThreadView } from '@/components/messages/thread-view'
import { NewThreadDialog } from '@/components/messages/new-thread-dialog'
import type { OrgRole } from '@/lib/roles'

interface Thread {
  id: string
  subject: string | null
  status: string
  last_message_at: string | null
  last_message_preview: string | null
  patient_profile_id: string
  patient: { first_name: string | null; last_name: string | null; email: string } | null
}

interface MessagesViewProps {
  threads: Thread[]
  patients: Array<{ id: string; first_name: string | null; last_name: string | null; email: string }>
  orgId: string
  userId: string
  role: OrgRole
}

export function MessagesView({ threads, patients, orgId, userId, role }: MessagesViewProps) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [newThreadOpen, setNewThreadOpen] = useState(false)

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-screen">
      {/* Thread sidebar */}
      <div className="w-full md:w-80 lg:w-96 border-r flex flex-col shrink-0"
        style={{ display: selectedThreadId ? undefined : undefined }}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="text-lg font-semibold">Messages</h1>
          <Button size="sm" variant="ghost" onClick={() => setNewThreadOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto">
          <ThreadList
            threads={threads}
            selectedThreadId={selectedThreadId}
            onSelect={setSelectedThreadId}
          />
        </div>
      </div>

      {/* Thread detail */}
      <div className="hidden md:flex flex-1 flex-col">
        {selectedThreadId ? (
          <ThreadView
            threadId={selectedThreadId}
            orgId={orgId}
            userId={userId}
            onBack={() => setSelectedThreadId(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a thread to view messages
          </div>
        )}
      </div>

      <NewThreadDialog
        open={newThreadOpen}
        onOpenChange={setNewThreadOpen}
        patients={patients}
        orgId={orgId}
      />
    </div>
  )
}
