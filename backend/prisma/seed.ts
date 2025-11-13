import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const user1 = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isEmailVerified: true,
      password: hashedPassword,
    }
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'teacher@test.com' },
    update: {},
    create: {
      email: 'teacher@test.com',
      firstName: 'Teacher',
      lastName: 'User',
      role: 'teacher',
      isEmailVerified: true,
      password: hashedPassword,
    }
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'student@test.com' },
    update: {},
    create: {
      email: 'student@test.com',
      firstName: 'Student',
      lastName: 'User',
      role: 'student',
      isEmailVerified: true,
      password: hashedPassword,
    }
  })

  console.log('✅ Created users:')
  console.log('  - admin@test.com (Admin User)')
  console.log('  - teacher@test.com (Teacher User)')
  console.log('  - student@test.com (Student User)')
  console.log('  - Password for all: password123')

  // Create a test chat between users
  const chat = await prisma.chat.create({
    data: {
      name: 'Test Chat',
      isGroup: true,
      participants: {
        create: [
          { userId: user1.id, isAdmin: true },
          { userId: user2.id },
          { userId: user3.id }
        ]
      }
    }
  })

  console.log('✅ Created test group chat with all users')

  console.log('🎉 Seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
