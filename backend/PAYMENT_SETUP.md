# MTN MoMo Payment Integration Setup Guide

## Overview

This guide will help you set up MTN MoMo Collection API for processing course enrollment payments.

## Prerequisites

1. MTN MoMo Developer Account
2. Collection API Subscription
3. API User and API Key

## Step 1: Get MTN MoMo API Credentials

### Register on MTN MoMo Developer Portal

1. Go to [MTN MoMo Developer Portal](https://momodeveloper.mtn.com/)
2. Sign up for an account
3. Subscribe to **Collection API** (Primary)

### Get Your Subscription Key

1. Navigate to your profile
2. Go to "Subscriptions"
3. Copy your **Primary Key** (this is your `MOMO_SUB_KEY`)

### Create API User (Sandbox)

Run these commands to create an API user:

```bash
# Set your subscription key
SUBSCRIPTION_KEY="your_subscription_key_here"

# Generate a UUID for API User
API_USER=$(uuidgen)  # or use any UUID generator

# Create API User
curl -X POST \
  https://sandbox.momodeveloper.mtn.com/v1_0/apiuser \
  -H "X-Reference-Id: $API_USER" \
  -H "Ocp-Apim-Subscription-Key: $SUBSCRIPTION_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "providerCallbackHost": "your-callback-url.com"
  }'

# Create API Key
curl -X POST \
  https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/$API_USER/apikey \
  -H "Ocp-Apim-Subscription-Key: $SUBSCRIPTION_KEY"
```

Save the response - this is your `MOMO_API_KEY`.

## Step 2: Configure Environment Variables

Add these variables to your `.env` file:

```env
# MTN MoMo Configuration
MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
MOMO_SUB_KEY=your_collection_primary_key
MOMO_API_USER=your_api_user_uuid
MOMO_API_KEY=your_api_key
MOMO_ENVIRONMENT=sandbox
MOMO_CALLBACK_URL=https://your-domain.com/payment/webhook
```

### Production Settings

For production, change:

- `MOMO_BASE_URL` to `https://proxy.momoapi.mtn.com`
- `MOMO_ENVIRONMENT` to `mtncameroon` or your target environment

## Step 3: Database Migration

The database schema has been updated with Payment and Enrollment models. Migration should already be applied, but if not:

```bash
npx prisma migrate dev --name add_payment_and_enrollment
```

## Step 4: Test Payment Flow

### Test Phone Numbers (Sandbox)

Use these MTN test numbers:

- `46733123450` - Will approve payment
- `46733123451` - Will reject payment
- `46733123452` - Will timeout

### Test Payment Request

```bash
POST /payment/initiate
{
  "courseId": 1,
  "phoneNumber": "46733123450",
  "amount": 5000,
  "location": {
    "address": "123 KN 5 Ave",
    "city": "Kigali",
    "province": "Kigali City",
    "country": "Rwanda"
  }
}
```

### Check Payment Status

```bash
GET /payment/status/{referenceId}
```

## API Endpoints

| Endpoint                           | Method | Description                     | Auth Required |
| ---------------------------------- | ------ | ------------------------------- | ------------- |
| `/payment/initiate`                | POST   | Initiate payment                | Yes           |
| `/payment/status/:referenceId`     | GET    | Check payment status            | Yes           |
| `/payment/my-payments`             | GET    | Get user's payment history      | Yes           |
| `/payment/course/:courseId/access` | GET    | Check if user can access course | Yes           |
| `/payment/webhook`                 | POST   | MTN MoMo callback               | No            |

## Payment Flow

1. **Student initiates payment**
   - Frontend calls `/payment/initiate` with course ID, phone number, amount, and location
   - Backend creates Payment record with `PENDING` status
   - MTN MoMo sends USSD prompt to student's phone

2. **Student completes payment on phone**
   - Student enters PIN on USSD prompt
   - MTN processes payment

3. **Payment status update**
   - Option A: Webhook receives callback from MTN (automatic)
   - Option B: Frontend polls `/payment/status/:referenceId`

4. **On successful payment**
   - Payment status updated to `SUCCESSFUL`
   - Enrollment record created
   - User profile location updated
   - Course access granted

## Webhook Setup

For production, you need a publicly accessible webhook URL:

1. Deploy your backend to a server with HTTPS
2. Set `MOMO_CALLBACK_URL` to `https://your-domain.com/payment/webhook`
3. Update your API User with this callback URL

## Troubleshooting

### Common Issues

**Issue: "Invalid subscription key"**

- Check your `MOMO_SUB_KEY` is correct
- Ensure you're using Collection API subscription key

**Issue: "Unauthorized"**

- Verify `MOMO_API_USER` and `MOMO_API_KEY` match
- Recreate API user if needed

**Issue: "Payment stuck in PENDING"**

- Check webhook URL is accessible
- Manually check status via `/payment/status/:referenceId`
- Verify phone number format (should be without +250)

**Issue: "Transaction failed"**

- In sandbox, use correct test phone numbers
- Check phone number has sufficient balance (production)

## Security Notes

1. **Never commit** `.env` file to git
2. **Keep API keys secret** - they grant access to your account
3. **Use HTTPS** for webhook callbacks
4. **Validate webhook signatures** (optional enhancement)

## Moving to Production

1. Get production API credentials from MTN
2. Update environment variables:
   ```env
   MOMO_BASE_URL=https://proxy.momoapi.mtn.com
   MOMO_ENVIRONMENT=mtncameroon  # or your country
   ```
3. Test with small real transactions first
4. Monitor payment success rates
5. Set up proper error logging and alerts

## Support

- MTN MoMo Developer Docs: https://momodeveloper.mtn.com/api-documentation
- Sandbox Portal: https://sandbox.momodeveloper.mtn.com
