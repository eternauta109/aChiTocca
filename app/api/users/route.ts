import { NextResponse } from 'next/server'
import { getUsers, addUser } from '@/lib/db'

export async function GET() {
  try {
    const users = getUsers()
    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: 'Errore nel recupero utenti' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: string }
    const name = body.name?.trim()
    if (!name) {
      return NextResponse.json({ error: 'Nome richiesto' }, { status: 400 })
    }
    const user = addUser(name)
    return NextResponse.json(user, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Errore nella creazione utente' }, { status: 500 })
  }
}
