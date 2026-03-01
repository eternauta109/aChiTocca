import { NextResponse } from 'next/server'
import { deleteUser } from '@/lib/db'

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const deleted = await deleteUser(params.id)
    if (!deleted) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Errore nella eliminazione utente' }, { status: 500 })
  }
}
