// Quick database check script
// Run this in your backend to see what data exists

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEnrollments() {
  console.log('=== Checking Enrollment Data ===\n');

  // Check Enrollment table
  const enrollments = await prisma.enrollment.findMany({
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      course: { select: { id: true, title: true } },
      payment: { select: { id: true, status: true } },
    },
  });

  console.log('Enrollment Records:', enrollments.length);
  console.log(JSON.stringify(enrollments, null, 2));

  // Check onGoingStudents relationships
  const coursesWithStudents = await prisma.course.findMany({
    where: { isConfirmed: true },
    select: {
      id: true,
      title: true,
      onGoingStudents: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
  });

  console.log('\n=== Courses with onGoingStudents ===');
  coursesWithStudents.forEach((course) => {
    console.log(`${course.title}: ${course.onGoingStudents.length} students`);
    course.onGoingStudents.forEach((student) => {
      console.log(`  - ${student.user?.firstName} ${student.user?.lastName}`);
    });
  });

  await prisma.$disconnect();
}

checkEnrollments();
