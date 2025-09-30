// src/csrf/csrf.controller.ts
import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { generateCsrfToken } from './csrf.config'; 

@Controller('csrf')
export class CsrfController {
  @Get('token')
  async getCsrfToken(@Req() req: Request, @Res() res: Response) {
    console.log('Received request for CSRF token');
    try {
      if (!req.session) {
        throw new Error('Session not initialized');
      }

      
      const token = generateCsrfToken(req, res); 
     

    
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ error: 'Failed to save session' });
        }

        return res.json({ 
          csrfToken: token
        });
      });
    } catch (error) {
      console.error(error)
 
      return res.status(500).json({ 
        message: 'Failed to generate CSRF token',
        error: error.message 
      });
    }
  }
}
