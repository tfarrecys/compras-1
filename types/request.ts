export interface Request {
  id: string
  email: string
  sector: string
  category?: string
  priority?: string
  description: string
  quantity?: string
  budget?: string
  observations?: string
  date: string
  status: string
  resolvedBy?: string
  resolvedByEmail?: string
  resolvedAt?: string
  user?: string
  createdAt?: Date
  updatedAt?: Date
} 