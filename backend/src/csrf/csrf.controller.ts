import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { generateCsrfToken } from '../csrf/csrf.config';

@Controller('csrf')
export class CsrfController {
  @Get('token')
  getCsrfToken(@Req() req: Request, @Res() res: Response) {
   
    const token = generateCsrfToken(req, res);
    
    
    return res.json({ csrfToken: token });
  }
}
