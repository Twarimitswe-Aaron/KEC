// src/quiz/quiz.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuizAttemptDto } from './dto/quiz-attempt.dto';
import { create } from 'domain';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

 async createQuiz(createQuizDto: CreateQuizDto) {

  const { questions = [], settings, name, description, resourceId } = createQuizDto;

  // Step 1: Validate inputs
  if (!name) {
    throw new Error('Quiz name is required');
  }

  if (!resourceId) {
    throw new Error('Resource ID is required');
  }

  // Step 2: Ensure the resource exists
  const resource = await this.prisma.resource.findUnique({
    where: { id: resourceId },
  });

  if (!resource) {
    throw new Error(`Resource with ID ${resourceId} not found`);
  }


  let form = await this.prisma.form.findFirst({
    where: { resourceId },
  });

  if (!form) {
    form = await this.prisma.form.create({
      data: {
     
        resource: {
          connect: { id: resourceId },
        },
      },
    });
  }

  // Step 4: Prepare Quiz data
  const data: any = {
    name,
    description: description || null,
    settings: settings ? JSON.stringify(settings) : null,
    form: { connect: { id: form.id } },
  };

  // Step 5: Add questions if provided
  if (questions && questions.length > 0) {
    data.questions = {
      create: questions.map((q, index) => ({
        type: q.type,
        question: q.question,
        options: q.options ? JSON.stringify(q.options) : null,
        correctAnswers: q.correctAnswers ? JSON.stringify(q.correctAnswers) : null,
        correctAnswer: q.correctAnswer ?? null,
        required: q.required ?? true,
        order: index,
        points: q.points || 1,
      })),
    };
  }

  console.log("Creating quiz with data:", JSON.stringify(data, null, 2));

  // Step 6: Create Quiz linked to the Form
  const quiz = await this.prisma.quiz.create({
    data,
    include: {
      questions: true,
      form: true,
    },
  });

  return {
    message: "Quiz created successfully"
   
  };
}

  async getQuizById(id: number) {
  const quiz = await this.prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
      },
      attempts: {
        orderBy: { submittedAt: 'desc' },
        take: 10,
      },
      form: {
        include: {
          resource: {
            select: {
              id: true,
              name: true,
              type: true,
              url: true,
            },
          },
        },
      },
    },
  });

  if (!quiz) {
    throw new NotFoundException(`Quiz with ID ${id} not found`);
  }

  // Extract resourceId safely through the form relation
  const resourceId = quiz.form?.resource?.id ?? null;

  // Parse JSON fields for better frontend usability
  return {
    id: quiz.id,
    name: quiz.name,
    description: quiz.description,
    resourceId,
    resource: quiz.form?.resource ?? null,
    settings: quiz.settings ? JSON.parse(quiz.settings) : null,
    questions: quiz.questions.map(q => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : null,
      correctAnswers: q.correctAnswers ? JSON.parse(q.correctAnswers) : [],
      correctAnswer: q.correctAnswer ?? undefined,
    })),
    attempts: quiz.attempts,
    createdAt: quiz.form?.createdAt ?? null,
  };
}


  async updateQuiz(id: number, updateQuizDto: UpdateQuizDto) {
    // Find the existing quiz
    const existingQuiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!existingQuiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    const { questions, settings, ...quizData } = updateQuizDto;
    
    // Filter out undefined values to only update provided fields
    const updateData: any = {};
    
    // Only include fields that were actually provided in the DTO
    if (quizData.name !== undefined) updateData.name = quizData.name;
    if (quizData.description !== undefined) updateData.description = quizData.description;
    if (settings !== undefined) updateData.settings = JSON.stringify(settings);

    // Update quiz with only the provided fields
    const updatedQuiz = await this.prisma.quiz.update({
      where: { id },
      data: updateData,
      include: { questions: true },
    });

    // Handle questions update if provided
    if (questions && questions.length > 0) {
      await this.updateQuizQuestions(id, questions, existingQuiz);
    }

    return this.getQuizById(id);
  }


  private async updateQuizQuestions(quizId: number, questions: any[], existingQuiz: any) {
    // Delete questions not in the update
    const existingQuestionIds = questions
      .filter(q => q.id)
      .map(q => q.id);

    await this.prisma.quizQuestion.deleteMany({
      where: {
        quizId,
        id: { notIn: existingQuestionIds },
      },
    });

    // Update or create questions
    for (const question of questions) {
      const { id, ...questionData } = question;
      
      if (id) {
        // Update existing question
        await this.prisma.quizQuestion.update({
          where: { id },
          data: {
            ...questionData,
            options: questionData.options ? JSON.stringify(questionData.options) : null,
            correctAnswers: questionData.correctAnswers ? JSON.stringify(questionData.correctAnswers) : null,
          },
        });
      } else {
        // Create new question
        await this.prisma.quizQuestion.create({
          data: {
            ...questionData,
            quizId,
            options: questionData.options ? JSON.stringify(questionData.options) : null,
            correctAnswers: questionData.correctAnswers ? JSON.stringify(questionData.correctAnswers) : null,
          },
        });
      }
    }
  }

  async patchQuiz(id: number, updateQuizDto: Partial<UpdateQuizDto>) {
    // Find the existing quiz
    const existingQuiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!existingQuiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    const { questions, settings, ...quizData } = updateQuizDto;
    
    // Build update data object with only provided fields
    const updateData: any = {};
    
    // Only include fields that were actually provided in the DTO
    if (quizData.name !== undefined) updateData.name = quizData.name;
    if (quizData.description !== undefined) updateData.description = quizData.description;
    if (settings !== undefined) updateData.settings = JSON.stringify(settings);

    // Update quiz with only the provided fields
    const updatedQuiz = await this.prisma.quiz.update({
      where: { id },
      data: updateData,
      include: { questions: true },
    });

    // Handle questions update if provided
    if (questions && questions.length > 0) {
      await this.updateQuizQuestions(id, questions, existingQuiz);
    }

    return this.getQuizById(id);
  }

  async deleteQuiz(id: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    // First delete all related questions
    if (quiz.questions && quiz.questions.length > 0) {
      await this.prisma.quizQuestion.deleteMany({
        where: { quizId: id },
      });
    }

    // Then delete the quiz
    await this.prisma.quiz.delete({
      where: { id },
    });

    return { message: 'Quiz deleted successfully' };
  }

  async submitQuizAttempt(createAttemptDto: CreateQuizAttemptDto) {
    const { quizId, responses } = createAttemptDto;

    // Verify quiz exists
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    // Parse questions with correct answers
    const parsedQuestions = quiz.questions.map(q => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : null,
      correctAnswers: q.correctAnswers ? JSON.parse(q.correctAnswers) : [],
      correctAnswer: q.correctAnswer !== null ? q.correctAnswer : undefined,
    }));

    // Calculate score and detailed results
    const { score, results } = this.calculateScoreWithDetails(parsedQuestions, responses);

    // Create attempt
    const attempt = await this.prisma.quizAttempt.create({
      data: {
        quizId,
        responses: JSON.stringify(responses),
        score,
        totalPoints: parsedQuestions.reduce((sum, q) => sum + (q.points || 1), 0),
        detailedResults: JSON.stringify(results),
      },
    });

    return {
      ...attempt,
      percentage: (score / parsedQuestions.reduce((sum, q) => sum + (q.points || 1), 0)) * 100,
      passed: score >= (quiz.settings ? JSON.parse(quiz.settings).passingScore || 0 : 0),
      results,
    };
  }

  private calculateScoreWithDetails(questions: any[], responses: any[]) {
    let score = 0;
    const results: any[] = [];

    responses.forEach(response => {
      const question = questions.find(q => q.id === response.questionId);
      if (!question) return;

      const userAnswer = response.answer;
      let isCorrect = false;
      let earnedPoints = 0;

      switch (question.type) {
        case 'multiple':
          // For multiple choice, compare with correctAnswer (index)
          if (question.correctAnswer !== undefined && userAnswer === question.correctAnswer) {
            isCorrect = true;
            earnedPoints = question.points || 1;
            score += earnedPoints;
          }
          break;

        case 'checkbox':
          // For checkbox, compare arrays of indices
          if (question.correctAnswers && Array.isArray(userAnswer) && Array.isArray(question.correctAnswers)) {
            const sortedUser = [...userAnswer].sort();
            const sortedCorrect = [...question.correctAnswers].sort();
            if (JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect)) {
              isCorrect = true;
              earnedPoints = question.points || 1;
              score += earnedPoints;
            }
          }
          break;

        case 'truefalse':
          // For true/false, compare with correctAnswer (index)
          if (question.correctAnswer !== undefined && userAnswer === question.correctAnswer) {
            isCorrect = true;
            earnedPoints = question.points || 1;
            score += earnedPoints;
          }
          break;

        case 'short':
        case 'long':
        case 'number':
          // For text/number questions, compare with correctAnswer (string/number)
          if (question.correctAnswer !== undefined && userAnswer === question.correctAnswer) {
            isCorrect = true;
            earnedPoints = question.points || 1;
            score += earnedPoints;
          }
          break;

        default:
          // Fallback for unknown types
          if (question.correctAnswer !== undefined && userAnswer === question.correctAnswer) {
            isCorrect = true;
            earnedPoints = question.points || 1;
            score += earnedPoints;
          }
      }

      results.push({
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer !== undefined ? question.correctAnswer : question.correctAnswers,
        isCorrect,
        points: question.points || 1,
        earnedPoints,
      });
    });

    return { score, results };
  }

  async getQuizAttempts(quizId: number) {
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { quizId },
      orderBy: { submittedAt: 'desc' },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
      },
    });

    return attempts.map(attempt => ({
      ...attempt,
      responses: attempt.responses ? JSON.parse(attempt.responses) : [],
      detailedResults: attempt.detailedResults ? JSON.parse(attempt.detailedResults) : [],
      percentage: (attempt.score / attempt.totalPoints) * 100,
      passed: attempt.score >= (attempt.quiz.settings ? JSON.parse(attempt.quiz.settings).passingScore || 0 : 0),
    }));
  }

  async getUserQuizAttempts(quizId: number, userId: number) {
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { 
        quizId,
        // Note: You'll need to add userId to your QuizAttempt model for this to work
        // userId: userId 
      },
      orderBy: { submittedAt: 'desc' },
    });

    return attempts.map(attempt => ({
      ...attempt,
      responses: attempt.responses ? JSON.parse(attempt.responses) : [],
      detailedResults: attempt.detailedResults ? JSON.parse(attempt.detailedResults) : [],
      percentage: (attempt.score / attempt.totalPoints) * 100,
      passed: attempt.score >= (50), // Default passing score, adjust as needed
    }));
  }


async getQuizzesByLesson(lessonId: number) {
  // ✅ Fetch resources that belong to the given lesson
  const resources = await this.prisma.resource.findMany({
    where: { lessonId },
    include: {
      form: {
        include: {
          quizzes: {
            include: {
              questions: { orderBy: { order: 'asc' } },
            },
          },
        },
      },
    },
  });

  // ✅ Flatten all quizzes from all resources and format them
  const quizzes = resources.flatMap((resource) => {
    // resource.form may be an array (e.g. forms[]) or a single object depending on schema/typing.
    const forms = Array.isArray(resource.form) ? resource.form : resource.form ? [resource.form] : [];
    const quizzesForResource = forms.flatMap((f) => f.quizzes ?? []);

    return quizzesForResource.map((quiz) => ({
      ...quiz,
      refreshRequired: false,
      questions: quiz.questions.map((q) => ({
        ...q,
        options: q.options ? JSON.parse(q.options) : [],
        correctAnswers: q.correctAnswers ? JSON.parse(q.correctAnswers) : [],
        correctAnswer: q.correctAnswer ?? undefined,
      })),
      settings: quiz.settings ? JSON.parse(quiz.settings) : null,
      resource: {
        id: resource.id,
        name: resource.name,
        type: resource.type,
        form: forms[0] ? { id: forms[0].id } : null,
      },
    }));
  });

  return quizzes;
}



  async getQuizStatistics(quizId: number) {
    const quiz = await this.getQuizById(quizId);
    const attempts = await this.getQuizAttempts(quizId);

    const totalAttempts = attempts.length;
    const averageScore = totalAttempts > 0 
      ? attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / totalAttempts 
      : 0;
    
    const passingScore = quiz.settings?.passingScore || 0;
    const passingRate = totalAttempts > 0
      ? (attempts.filter(attempt => attempt.percentage >= passingScore).length / totalAttempts) * 100
      : 0;

    const questionStatistics = quiz.questions.map(question => {
      const questionAttempts = attempts.filter(attempt => 
        attempt.responses.some((response: any) => response.questionId === question.id)
      );
      
      const correctAnswers = questionAttempts.filter(attempt => {
        const response = attempt.responses.find((r: any) => r.questionId === question.id);
        if (!response) return false;

        // This is a simplified check - you might want to use the detailedResults instead
        const detailedResult = attempt.detailedResults?.find((r: any) => r.questionId === question.id);
        return detailedResult?.isCorrect || false;
      }).length;

      return {
        questionId: question.id,
        question: question.question,
        correctAnswers,
        totalAttempts: questionAttempts.length,
        successRate: questionAttempts.length > 0 ? (correctAnswers / questionAttempts.length) * 100 : 0,
      };
    });

    return {
      totalAttempts,
      averageScore,
      passingRate,
      questionStatistics,
    };
  }

 async duplicateQuiz(id: number, name: string, req: Request) {
  // ✅ Step 1: (optional) CSRF session check (keep commented until test)
  // if (!req.session || !req.session.csrfToken) {
  //   return {
  //     refreshRequired: true,
  //     message: 'CSRF token not found in session',
  //   };
  // }

  // ✅ Step 2: Fetch original quiz
  const originalQuiz = await this.getQuizById(id);
  const form=await this.getQuizById(id);


  // ✅ Step 3: Duplicate the quiz and connect its form
  // const duplicatedQuiz = await this.prisma.quiz.create({
  //   data: {
  //     name,
  //     description: originalQuiz.description,
  
  //     settings: originalQuiz.settings
  //       ? JSON.stringify(originalQuiz.settings)
  //       : null,
  //     form: {
  //       create: {
  //         title: `${name} Form`,
  //         description: originalQuiz.description || '',
  //         ...(form.resourceId ? { resource: { connect: { id: form.resourceId } } } : {}),
  //       },
  //     },
  //     questions: {
  //       create: originalQuiz.questions.map((q) => ({
  //         type: q.type,
  //         question: q.question,
  //         options: q.options ? JSON.stringify(q.options) : null,
  //         correctAnswers: q.correctAnswers
  //           ? JSON.stringify(q.correctAnswers)
  //           : null,
  //         correctAnswer:
  //           q.correctAnswer !== undefined ? q.correctAnswer : null,
  //         required: q.required,
  //         order: q.order,
  //         points: q.points,
  //       })),
  //     },
  //   },
  //   include: {
  //     questions: true,
  //     form: true, // ✅ make sure form data is returned
  //     resource: true,
  //   },
  // });

  // // ✅ Step 4: Parse JSON fields safely
  // return {
  //   ...duplicatedQuiz,
  //   questions: duplicatedQuiz.questions.map((q) => ({
  //     ...q,
  //     options: q.options ? JSON.parse(q.options) : null,
  //     correctAnswers: q.correctAnswers
  //       ? JSON.parse(q.correctAnswers)
  //       : [],
  //     correctAnswer:
  //       q.correctAnswer !== null ? q.correctAnswer : undefined,
  //   })),
  //   settings: duplicatedQuiz.settings
  //     ? JSON.parse(duplicatedQuiz.settings)
  //     : null,
  // };
}


}