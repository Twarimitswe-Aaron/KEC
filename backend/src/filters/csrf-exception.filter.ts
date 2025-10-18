import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(Error)
export class CsrfExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception.message.includes('CSRF') || exception.message.includes('csrf')) {
      console.error('CSRF-related error:', {
        message: exception.message,
        sessionId: request.sessionID,
        url: request.url
      });

      response.status(403).json({
        message: 'CSRF validation failed',
        code: 'CSRF_ERROR',
        timestamp: new Date().toISOString()
      });
    } else {
      
      throw exception;
    }
  }
}