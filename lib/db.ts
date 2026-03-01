import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import type { User } from './types'

interface DB {
  users: User[]
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json')

function readDB(): DB {
  if (!fs.existsSync(DB_PATH)) {
    const initial: DB = { users: [] }
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2))
    return initial
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) as DB
}

function writeDB(db: DB): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

export function getUsers(): User[] {
  return readDB().users
}

export function addUser(name: string): User {
  const db = readDB()
  const user: User = {
    id: uuidv4(),
    name: name.trim(),
    coffeeCount: 0,
    lastBought: null,
  }
  db.users.push(user)
  writeDB(db)
  return user
}

export function deleteUser(id: string): boolean {
  const db = readDB()
  const index = db.users.findIndex((u) => u.id === id)
  if (index === -1) return false
  db.users.splice(index, 1)
  writeDB(db)
  return true
}

export function recordCoffee(userId: string): User | null {
  const db = readDB()
  const user = db.users.find((u) => u.id === userId)
  if (!user) return null
  user.coffeeCount++
  user.lastBought = new Date().toISOString()
  writeDB(db)
  return user
}
