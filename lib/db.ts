import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue, Timestamp, type DocumentData } from 'firebase-admin/firestore'
import type { User } from './types'

function getDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }
  return getFirestore()
}

function mapDoc(id: string, data: DocumentData): User {
  return {
    id,
    name: data.name as string,
    coffeeCount: data.coffeeCount as number,
    lastBought:
      data.lastBought instanceof Timestamp
        ? data.lastBought.toDate().toISOString()
        : null,
  }
}

export async function getUsers(): Promise<User[]> {
  const snapshot = await getDb().collection('users').get()
  return snapshot.docs.map((doc) => mapDoc(doc.id, doc.data()))
}

export async function addUser(name: string): Promise<User> {
  const ref = await getDb().collection('users').add({
    name: name.trim(),
    coffeeCount: 0,
    lastBought: null,
  })
  const doc = await ref.get()
  return mapDoc(doc.id, doc.data()!)
}

export async function deleteUser(id: string): Promise<boolean> {
  await getDb().collection('users').doc(id).delete()
  return true
}

export async function recordCoffee(userId: string): Promise<User | null> {
  const ref = getDb().collection('users').doc(userId)
  await ref.update({
    coffeeCount: FieldValue.increment(1),
    lastBought: Timestamp.now(),
  })
  const doc = await ref.get()
  if (!doc.exists) return null
  return mapDoc(doc.id, doc.data()!)
}
