import { NextResponse } from 'next/server'
import { recordCoffee } from '@/lib/db'

export async function POST(_request: Request, { params }: { params: { userId: string } }) {
  try {
    const user = recordCoffee(params.userId)
    if (!user) {
      return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
    }
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Errore nel registrare il caffè' }, { status: 500 })
  }
}
