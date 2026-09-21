import { PrismaClient } from '@prisma/client'
import { exercises } from '../lib/exercises'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')
  
  // Create guest user
  const user = await prisma.user.upsert({
    where: { email: 'guest@breakmysystem.dev' },
    update: {},
    create: {
      id: 'guest-user',
      email: 'guest@breakmysystem.dev',
      name: 'Guest User'
    }
  })
  console.log('✓ Created guest user:', user.email)
  
  // Create exercises
  console.log('Number of exercises:', exercises?.length)
  console.log('Exercises:', exercises?.map(e => e?.id))
  
  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { id: exercise.id },
      update: {
        title: exercise.title,
        setting: exercise.setting,
        duration: exercise.duration,
        conceptsPreview: exercise.conceptsPreview,
        openingStory: exercise.openingStory,
        objectives: exercise.objectives,
        constraints: exercise.constraints,
        ordinal: exercise.ordinal
      },
      create: {
        id: exercise.id,
        title: exercise.title,
        setting: exercise.setting,
        duration: exercise.duration,
        conceptsPreview: exercise.conceptsPreview,
        openingStory: exercise.openingStory,
        objectives: exercise.objectives,
        constraints: exercise.constraints,
        ordinal: exercise.ordinal
      }
    })
    console.log('✓ Created exercise:', exercise.title)
  }
  
  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
