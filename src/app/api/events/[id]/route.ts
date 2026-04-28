import { NextRequest } from 'next/server'
import { eventsService } from '@/lib/services/events.service'
import { apiResponse, apiError } from '@/lib/utils'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const event = await eventsService.getWithBetCounts(params.id)
    return apiResponse(event)
  } catch (e: any) {
    return apiError(e.message, 404)
  }
}
