# Email Configuration Guide

## Required Environment Variables

Add these variables to your `.env` file in the backend directory:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM_NAME=KEC Platform
```

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and your device
   - Copy the generated 16-character password
   - Use this as `EMAIL_PASSWORD` in your `.env` file

## Other Email Providers

### Outlook/Hotmail

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

### Yahoo

```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
```

### Custom SMTP

```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_USER=your-username
EMAIL_PASSWORD=your-password
```

## Testing Email Functionality

1. Approve a certificate in the Certificate Management page
2. Check the student's email inbox
3. Email should arrive with:
   - Professional HTML template
   - Certificate number
   - Course name
   - Congratulations message

## Troubleshooting

- **Emails not sending**: Check your email credentials in `.env`
- **Gmail blocking**: Make sure you're using an App Password, not your regular password
- **Port issues**: Try port 465 with `secure: true` in the email service
- **Check backend logs**: Look for "Certificate email sent" or error messages

## Email Template Customization

The email template is located in:
`backend/src/email/email.service.ts`

You can customize:

- Colors and styling
- Email content
- Company branding
- Footer information
