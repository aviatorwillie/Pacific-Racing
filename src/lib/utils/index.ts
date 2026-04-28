import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) { return clsx(inputs) }

export function formatKina(amount: number): string {
  return `K ${amount.toLocaleString('en-PG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function calcPayout(stake: number, odds: number): number {
  return Math.round(stake * odds * 100) / 100
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'live': return 'text-green-400 bg-green-400/10 border-green-400/25'
    case 'upcoming': return 'text-blue-400 bg-blue-400/10 border-blue-400/25'
    case 'closed': return 'text-gray-400 bg-gray-400/10 border-gray-400/25'
    case 'resulted': return 'text-purple-400 bg-purple-400/10 border-purple-400/25'
    case 'won': return 'text-green-400 bg-green-400/10 border-green-400/25'
    case 'lost': return 'text-red-400 bg-red-400/10 border-red-400/25'
    case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/25'
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
  }
}

export function apiResponse<T>(data: T, status = 200) {
  return Response.json({ data, error: null }, { status })
}

export function apiError(message: string, status = 400) {
  return Response.json({ data: null, error: message }, { status })
}
