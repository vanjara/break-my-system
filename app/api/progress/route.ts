import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const QuerySchema = z.object({
  userId: z.string()
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }
    
    const progressRecords = await prisma.progressRecord.findMany({
      where: { userId },
      orderBy: { lastAttemptAt: 'desc' }
    })
    
    const sessions = await prisma.exerciseSession.findMany({
      where: { userId },
      include: { exercise: true },
      orderBy: { lastActivity: 'desc' }
    })
    
    return NextResponse.json({
      progressRecords,
      sessions
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}
