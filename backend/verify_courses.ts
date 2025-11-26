import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { CourseService } from './src/course/course.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const courseService = app.get(CourseService);

  console.log('Fetching uploaded courses...');
  try {
    const courses = await courseService.findAllUploaded();
    console.log(`Found ${courses.length} courses.`);

    const endedCourses = courses.filter((c) => c.status === 'ENDED');
    console.log(`Found ${endedCourses.length} ENDED courses.`);

    courses.forEach((c) => {
      console.log(`ID: ${c.id}, Title: ${c.title}, Status: ${c.status}`);
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
  }

  await app.close();
}

bootstrap();
