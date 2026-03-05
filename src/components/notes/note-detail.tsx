'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { signNote } from '@/app/actions/notes'

interface NoteDetailProps {
  note: {
    id: string
    title: string | null
    type: string
    body: string
    is_signed: boolean
    signed_at: string | null
    created_at: string
    author: { display_name: string | null } | null
    signer: { display_name: string | null } | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  orgId: string
  userId: string
  canSign: boolean
}

export function NoteDetail({ note, open, onOpenChange, orgId, canSign }: NoteDetailProps) {
  const router = useRouter()
  const [signing, setSigning] = useState(false)

  async function handleSign() {
    setSigning(true)
    const result = await signNote({ orgId, noteId: note.id })
    setSigning(false)
    if (!result.error) {
      onOpenChange(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {note.title ?? note.type.replace('_', ' ')}
            <Badge variant={note.is_signed ? 'default' : 'secondary'} className="text-xs">
              {note.is_signed ? 'Signed' : 'Draft'}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Author: {note.author?.display_name ?? 'Unknown'}</p>
            <p>Created: {new Date(note.created_at).toLocaleString()}</p>
            {note.is_signed && note.signer && (
              <p>
                Signed by {note.signer.display_name} on{' '}
                {note.signed_at ? new Date(note.signed_at).toLocaleString() : ''}
              </p>
            )}
          </div>
          <div className="whitespace-pre-wrap text-sm leading-relaxed border rounded-lg p-4 bg-muted/50">
            {note.body}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {canSign && (
            <Button onClick={handleSign} disabled={signing}>
              {signing ? 'Signing...' : 'Sign Note'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
