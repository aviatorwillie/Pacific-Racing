import { NextRequest } from 'next/server'
import { eventsService } from '@/lib/services/events.service'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const view = req.nextUrl.searchParams.get('view') // 'trending' | 'upcoming' | 'all'
  const hours = parseInt(req.nextUrl.searchParams.get('hours') || '24')
  const status = req.nextUrl.searchParams.get('status') || undefined

  try {
    if (view === 'trending') {
      return apiResponse(await eventsService.getTrendingGrouped())
    }
    if (view === 'upcoming') {
      const validHours = ([12, 24, 48].includes(hours) ? hours : 24) as 12 | 24 | 48
      return apiResponse(await eventsService.getUpcomingGrouped(validHours))
    }
    if (view === 'all_sports') {
      return apiResponse(await eventsService.getAllSportsGrouped())
    }
    // Default: flat list (backward compatibility)
    return apiResponse(await eventsService.getAll(status))
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
