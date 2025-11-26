import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching courses directly via Prisma...');
  try {
    const courses = await prisma.course.findMany({
      where: { isConfirmed: true },
      select: { id: true, title: true, status: true, isConfirmed: true },
    });

    console.log(`Found ${courses.length} confirmed courses.`);

    const endedCourses = courses.filter((c) => c.status === 'ENDED');
    console.log(`Found ${endedCourses.length} ENDED courses.`);

    courses.forEach((c) => {
      console.log(`ID: ${c.id}, Title: ${c.title}, Status: ${c.status}`);
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
