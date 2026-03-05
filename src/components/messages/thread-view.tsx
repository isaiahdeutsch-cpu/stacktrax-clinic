'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { MessageBubble } from '@/components/messages/message-bubble'
import { MessageInput } from '@/components/messages/message-input'
import { sendMessage, getThreadMessages, markMessagesRead } from '@/app/actions/messages'

interface Message {
  id: string
  body: string
  sender_id: string
  is_read: boolean
  created_at: string
  sender?: { display_name: string | null } | null
}

interface ThreadViewProps {
  threadId: string
  orgId: string
  userId: string
  onBack: () => void
}

export function ThreadView({ threadId, orgId, userId, onBack }: ThreadViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const result = await getThreadMessages({ orgId, threadId })
      setMessages(result.messages ?? [])
      setLoading(false)

      // Mark messages as read
      await markMessagesRead({ orgId, threadId })
    }
    load()
  }, [threadId, orgId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(body: string) {
    const result = await sendMessage({ orgId, threadId, body })
    if (!result.error && result.message) {
      setMessages((prev) => [...prev, result.message!])
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">Thread</span>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-muted-foreground text-sm py-8">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">No messages yet.</div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              body={msg.body}
              senderName={msg.sender?.display_name ?? null}
              isOwn={msg.sender_id === userId}
              timestamp={msg.created_at}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={handleSend} />
    </div>
  )
}
