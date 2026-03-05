import { cn } from '@/lib/utils'

interface MessageBubbleProps {
  body: string
  senderName: string | null
  isOwn: boolean
  timestamp: string
}

export function MessageBubble({ body, senderName, isOwn, timestamp }: MessageBubbleProps) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-2',
          isOwn
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        {!isOwn && senderName && (
          <p className="text-xs font-medium mb-1 opacity-70">{senderName}</p>
        )}
        <p className="text-sm whitespace-pre-wrap">{body}</p>
        <p className={cn('text-xs mt-1', isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}
