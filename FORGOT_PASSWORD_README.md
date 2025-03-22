# Forgot Password Functionality

This document explains how to set up and use the forgot password functionality in the KeyMap application.

## Overview

The forgot password flow allows users to reset their password through the following steps:

1. User requests a password reset by entering their email address
2. If the email exists in the database, a reset token is generated and an email is sent with a reset link
3. User clicks the link in the email, which takes them to the reset password page
4. The reset token is validated, and if valid, the user can set a new password
5. After setting a new password, the user is redirected to the login page

## Setup

### 1. Environment Variables

Create a `.env.local` file in the root of the project with the following variables:

```
# Resend API Key - Get this from https://resend.com
RESEND_API_KEY=your_resend_api_key_here

# Default from email address - This is the address emails will be sent from
DEFAULT_FROM_EMAIL=noreply@keymap.com

# Application URL - Used to create the reset link in the email
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Install Dependencies

Make sure you have the Resend package installed:

```bash
npm install resend
```

## Implementation Details

- **`/forgot-password`**: Page where users can request a password reset
- **`/reset-password`**: Page where users can set a new password after clicking the reset link
- **`/api/auth/forgot-password`**: API endpoint that processes password reset requests
- **`/api/auth/verify-reset-token`**: API endpoint that validates reset tokens
- **`/api/auth/reset-password`**: API endpoint that processes password reset submissions

## Development Notes

- In development, if the `RESEND_API_KEY` is not set, the API will log the reset link to the console instead of sending an email
- Reset tokens expire after 1 hour
- For security reasons, the API always returns a success response for password reset requests, even if the email doesn't exist

## Production Considerations

For production deployment, consider the following:

1. Use a proper database to store user data and reset tokens
2. Add rate limiting to prevent abuse of the password reset endpoint
3. Use a proper password hashing library (like bcrypt) to securely hash passwords
4. Add logging and monitoring to track password reset attempts
5. Consider adding additional security measures, such as requiring the user to answer security questions 