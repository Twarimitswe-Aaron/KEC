import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { generateCsrfToken } from '../csrf/csrf.config';

@Controller('csrf')
export class CsrfController {
  @Get('token')
  getCsrfToken(@Req() req: Request, @Res() res: Response) {
    console.log('CSRF token endpoint hit');
    console.log('Session ID:', req.cookies?.sid);
    
    const token = generateCsrfToken(req, res);
    console.log('Generated CSRF token:', token);
    
    return res.json({ csrfToken: token });
  }
}
