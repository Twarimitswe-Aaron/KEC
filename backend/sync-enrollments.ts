import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * This script syncs existing onGoingStudents to the Enrollment table
 * Run this if students were enrolled before the Enrollment table was created
 */
async function syncEnrollments() {
  console.log('Starting enrollment sync...\n');

  const courses = await prisma.course.findMany({
    where: { isConfirmed: true },
    include: {
      onGoingStudents: {
        include: {
          user: true,
        },
      },
    },
  });

  let synced = 0;
  let skipped = 0;

  for (const course of courses) {
    console.log(
      `\nProcessing course: ${course.title} (${course.onGoingStudents.length} students)`,
    );

    for (const student of course.onGoingStudents) {
      if (!student.user) {
        console.log(`  ⚠️  Skipping student ${student.id} - no user found`);
        skipped++;
        continue;
      }

      // Check if enrollment record already exists
      const existing = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: student.userId,
            courseId: course.id,
          },
        },
      });

      if (existing) {
        console.log(
          `  ⏭️  ${student.user.firstName} ${student.user.lastName} - already has enrollment record`,
        );
        skipped++;
      } else {
        // Create enrollment record
        await prisma.enrollment.create({
          data: {
            userId: student.userId,
            courseId: course.id,
            sessionId: course.sessionId,
            enrollmentDate: new Date(), // Use current date since we don't have the original
          },
        });
        console.log(
          `  ✅ ${student.user.firstName} ${student.user.lastName} - enrollment record created`,
        );
        synced++;
      }
    }
  }

  console.log(`\n===== Sync Complete =====`);
  console.log(`✅ Synced: ${synced}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📊 Total processed: ${synced + skipped}`);

  await prisma.$disconnect();
}

syncEnrollments().catch((error) => {
  console.error('Error during sync:', error);
  process.exit(1);
});
