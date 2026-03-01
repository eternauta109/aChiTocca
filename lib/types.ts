export interface User {
  id: string
  name: string
  coffeeCount: number
  lastBought: string | null
}

export type SortField = 'name' | 'coffeeCount' | 'lastBought'
export type SortOrder = 'asc' | 'desc'
