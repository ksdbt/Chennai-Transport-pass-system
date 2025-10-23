# Email Setup Guide for Password Reset

## Overview
The password reset functionality now sends emails using **Resend** - a free email service that allows you to send up to 100 emails per day for free.

## Setup Instructions

### 1. Get a Free Resend API Key
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Get your API key from the dashboard

### 2. Add Environment Variable
Create a `.env` file in the server directory and add:
```
RESEND_API_KEY=your_resend_api_key_here
```

### 3. How It Works
- When a user requests a password reset, the system:
  1. Generates a secure reset token
  2. Sends a beautiful HTML email with the reset link
  3. Provides fallback options if email fails

### 4. Email Features
- ✅ Professional HTML email design
- ✅ Chennai Transport Pass System branding
- ✅ Secure reset links that expire in 1 hour
- ✅ Fallback to display link on page if email fails
- ✅ User-friendly error handling

### 5. Testing
- Use any valid email address to test
- Check both inbox and spam folder
- The system works even without a Resend API key (uses fallback mode)

## Free Tier Limits
- **Resend**: 100 emails/day free
- **Perfect for development and small applications**

## Security Features
- Reset tokens expire after 1 hour
- Tokens are cryptographically secure
- Email includes security warnings
- Fallback mechanisms for reliability
