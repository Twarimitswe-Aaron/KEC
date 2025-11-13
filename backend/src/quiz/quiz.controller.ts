// src/quiz/quiz.controller.ts
import { BadRequestException, Logger } from '@nestjs/common';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Req,
  UseInterceptors,
  ClassSerializerInterceptor,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  UploadedFile,
  HttpStatus,
  Patch,
  UseGuards,
  UploadedFiles,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { FileInterceptor, FilesInterceptor, FileFieldsInterceptor, AnyFilesInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import type { Multer } from 'multer';
import { QuizService } from './quiz.service';
import { CreateQuizDto, CreateManualQuizDto, UpdateManualMarksDto } from './dto/create-quiz.dto';
import { UpdateQuizDto, UpdateQuizQuestionDto } from './dto/update-quiz.dto';
import { CreateQuizAttemptDto } from './dto/quiz-attempt.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

// Configure multer for file uploads
const quizImageStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'course_url');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate filename with timestamp and random number pattern
    const timestamp = Date.now();
    const randomNumber = Math.floor(Math.random() * 1000000000);
    const extension = extname(file.originalname);
    cb(null, `quiz_image-${timestamp}-${randomNumber}${extension}`);
  },
});

const quizImageFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Configure multer for question image uploads
const questionImageStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'course_url');
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate filename with timestamp and random number pattern
    const timestamp = Date.now();
    const randomNumber = Math.floor(Math.random() * 1000000000);
    const extension = extname(file.originalname);
    cb(null, `question_image-${timestamp}-${randomNumber}${extension}`);
  },
});

@Controller('quizzes')
@UseInterceptors(ClassSerializerInterceptor)
export class QuizController {
  private readonly logger = new Logger(QuizController.name);

  constructor(
    private readonly quizService: QuizService,
    private readonly configService: ConfigService
  ) {}

  @Post('upload-question-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: questionImageStorage,
    fileFilter: quizImageFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  }))
  async uploadQuestionImage(@UploadedFile() file: Express.Multer.File, @Req() request: Request): Promise<{ url: string; filename: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Return relative URL for consistency
    return {
      url: `/uploads/course_url/${file.filename}`,
      filename: file.filename,
    };
  }

  @Get('quiz/')
  findQuizDataByQuizId(
    @Query('quizId', ParseIntPipe) quizId: number,
    @Query('lessonId', ParseIntPipe) lessonId: number,
    @Query('courseId', ParseIntPipe) courseId: number,
    @Query('formId', ParseIntPipe) formId: number,
  ) {
    return this.quizService.getQuizDataByQuiz({ quizId, lessonId, courseId, formId });
  }

  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor({
    storage: quizImageStorage,
    fileFilter: quizImageFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
      files: 10, // Maximum number of files
    },
    preservePath: false
  }))
  async updateQuiz(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: any[] = [],
    @Req() req: any,
  ) {
    // Parse the form data
    const updateQuizDto: UpdateQuizDto = {
      name: req.body.name,
      description: req.body.description,
      questions: JSON.parse(req.body.questions || '[]'),
      settings: JSON.parse(req.body.settings || '{}'),
      courseId: parseInt(req.body.courseId, 10),
      lessonId: parseInt(req.body.lessonId, 10),
      quizId: req.body.quizId ? parseInt(req.body.quizId, 10) : undefined,
      formId: req.body.formId ? parseInt(req.body.formId, 10) : undefined,
    };

    // Handle the main quiz image
    const mainImage = files.find(f => f.fieldname === 'image');
    if (mainImage) {
      updateQuizDto.imageUrl = `/uploads/course_url/${mainImage.filename}`;
    }

    // Process question images
    const questionImages = files
      .filter(f => f.fieldname.startsWith('question-') && f.fieldname.endsWith('-image'))
      .reduce((acc, file) => {
        const match = file.fieldname.match(/question-(\d+)-image/);
        if (match) {
          const index = parseInt(match[1], 10);
          acc[index] = file;
        }
        return acc;
      }, {});

    // Update questions with their respective images
    if (updateQuizDto.questions) {
      updateQuizDto.questions = updateQuizDto.questions.map((q, index) => {
        const newImageUrl = questionImages[index] 
          ? `${this.configService.get('BACKEND_URL')}/uploads/course_url/${questionImages[index].filename}`
          : q.imageUrl;
        
        
        return {
          ...q,
          imageFile: questionImages[index],
          // Preserve existing image URL if no new file is uploaded
          imageUrl: newImageUrl
        };
      });
    }

    return this.quizService.updateQuiz({ id, data: updateQuizDto });
  }

  @Get('courses-with-data')
  async getCoursesWithLessonsAndQuizzes() {
    return this.quizService.getCoursesWithLessonsAndQuizzes();
  }

  // Create manual quiz (for assignments, practical tests, etc.)
  @Post('manual-quiz')
  @HttpCode(HttpStatus.CREATED)
  async createManualQuiz(@Body() createManualQuizDto: CreateManualQuizDto) {
    return this.quizService.createManualQuiz(createManualQuizDto);
  }

  // Update student marks for manual quizzes
  @Put('update-manual-marks')
  @HttpCode(HttpStatus.OK)
  async updateManualMarks(@Body() updateManualMarksDto: UpdateManualMarksDto) {
    return this.quizService.updateManualMarks(updateManualMarksDto);
  }

  // Get quiz participants with marks
  @Get('quiz/:quizId/participants')
  async getQuizParticipants(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Query('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.quizService.getQuizParticipants(quizId, courseId);
  }

}