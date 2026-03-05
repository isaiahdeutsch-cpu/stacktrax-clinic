'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreateNoteDialog } from '@/components/notes/create-note-dialog'
import { NoteDetail } from '@/components/notes/note-detail'
import type { OrgRole } from '@/lib/roles'
import { hasMinRole } from '@/lib/roles'

interface Note {
  id: string
  title: string | null
  type: string
  body: string
  is_signed: boolean
  signed_at: string | null
  created_at: string
  author_id: string
  author: { display_name: string | null } | null
  signer: { display_name: string | null } | null
}

interface NotesListProps {
  notes: Note[]
  patientId: string
  orgId: string
  userId: string
  role: OrgRole
}

export function NotesList({ notes, patientId, orgId, userId, role }: NotesListProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const canCreate = hasMinRole(role, 'clinician')

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Clinical Notes</h2>
        {canCreate && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 h-3 w-3" />
            New Note
          </Button>
        )}
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No clinical notes yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card
              key={note.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setSelectedNote(note)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{note.title ?? note.type.replace('_', ' ')}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{note.type}</Badge>
                    <Badge variant={note.is_signed ? 'default' : 'secondary'} className="text-xs">
                      {note.is_signed ? 'Signed' : 'Draft'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{note.body}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  By {note.author?.display_name ?? 'Unknown'} on{' '}
                  {new Date(note.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateNoteDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        patientId={patientId}
        orgId={orgId}
      />

      {selectedNote && (
        <NoteDetail
          note={selectedNote}
          open={!!selectedNote}
          onOpenChange={(open) => !open && setSelectedNote(null)}
          orgId={orgId}
          userId={userId}
          canSign={canCreate && !selectedNote.is_signed}
        />
      )}
    </div>
  )
}
