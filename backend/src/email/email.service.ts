import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST') || 'smtp.gmail.com',
      port: this.configService.get('SMTP_PORT') || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendCertificateEmail(
    recipientEmail: string,
    recipientName: string,
    courseName: string,
    certificateNumber: string,
    certificateUrl?: string,
  ) {
    const mailOptions = {
      from: `"${this.configService.get('EMAIL_FROM_NAME') || 'KEC Platform'}" <${this.configService.get('SMTP_USER')}>`,
      to: recipientEmail,
      subject: `🎓 Your Certificate for ${courseName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #004e64 0%, #025a73 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .certificate-box {
              background: white;
              border: 2px solid #004e64;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            .certificate-number {
              font-size: 24px;
              font-weight: bold;
              color: #004e64;
              margin: 10px 0;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #004e64 0%, #025a73 100%);
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎓 Congratulations!</h1>
          </div>
          <div class="content">
            <p>Dear ${recipientName},</p>
            
            <p>We are pleased to inform you that your certificate for the course <strong>"${courseName}"</strong> has been approved and is now ready!</p>
            
            <div class="certificate-box">
              <p>📜 Certificate Number</p>
              <div class="certificate-number">${certificateNumber}</div>
            </div>
            
            ${
              certificateUrl
                ? `
              <div style="text-align: center;">
                <a href="${certificateUrl}" class="button">Download Your Certificate</a>
              </div>
            `
                : ''
            }
            
            <p>This certificate recognizes your successful completion of the course and demonstrates your commitment to learning and professional development.</p>
            
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>Share your achievement on LinkedIn and other professional networks</li>
              <li>Add this certificate to your resume or portfolio</li>
              <li>Continue your learning journey with our other courses</li>
            </ul>
            
            <p>Thank you for being part of our learning community!</p>
            
            <p>Best regards,<br>
            <strong>The KEC Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} KEC Platform. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(
        `Certificate email sent to ${recipientEmail}:`,
        info.messageId,
      );
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending certificate email:', error);
      throw error;
    }
  }

  async sendBulkCertificateEmails(
    certificates: Array<{
      email: string;
      name: string;
      courseName: string;
      certificateNumber: string;
      certificateUrl?: string;
    }>,
  ) {
    const results: Array<{
      email: string;
      success: boolean;
      messageId?: string;
      error?: string;
    }> = [];

    for (const cert of certificates) {
      try {
        const result = await this.sendCertificateEmail(
          cert.email,
          cert.name,
          cert.courseName,
          cert.certificateNumber,
          cert.certificateUrl,
        );
        results.push({
          email: cert.email,
          success: true,
          messageId: result.messageId,
        });
      } catch (error) {
        results.push({
          email: cert.email,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }
}
