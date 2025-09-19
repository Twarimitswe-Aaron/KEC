// src/csrf/csrf.controller.ts
import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { generateCsrfToken } from './csrf.config'; // Make sure this function is correct

@Controller('csrf')
export class CsrfController {
  @Get('token')
  async getCsrfToken(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.session) {
        throw new Error('Session not initialized');
      }

      console.log('Generating CSRF token for session:', req.sessionID);
      console.log('Current session data:', req.session);
      
      const token = generateCsrfToken(req, res); // Ensure your CSRF token generation is correct
      console.log("✅ CSRF token generated");

      // Force session save to ensure persistence
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ error: 'Failed to save session' });
        }

        return res.json({ 
          csrfToken: token,
          sessionId: req.sessionID 
        });
      });
    } catch (error) {
      console.error('❌ CSRF token generation failed:', error);
      return res.status(500).json({ 
        message: 'Failed to generate CSRF token',
        error: error.message 
      });
    }
  }
}
