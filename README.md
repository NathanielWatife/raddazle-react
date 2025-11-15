# Raddazle React Frontend

This is the React.js frontend for the Raddazle E-commerce application.

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
```

Builds the app for production to the `build` folder.

## Project Structure

- `/src/components` - Reusable React components
- `/src/pages` - Page components for routing
- `/src/services` - API service layer
- `/src/context` - React Context for state management
- `/src/styles` - CSS stylesheets
- `/public` - Static assets

## Features

- React Router for navigation
- Context API for state management
- Bootstrap for styling
- Axios for API calls
- Admin dashboard
- Shopping cart functionality
- User authentication

## Auth flows

- Signup requires email verification. After creating an account, users receive a 6‑digit code via email. They can:
	- Enter the code on the Register page (step 2), or
	- Use the email button to open `/verify-email?email=...` and verify there.

- Login will prompt unverified users inline to enter a 6‑digit code or resend it.

- Forgot/Reset password:
	- Use `/forgot-password` to request a 6‑digit reset code.
	- Email includes a button to `/reset-password?email=...&code=...` and the code itself.
	- On `/reset-password`, submit email, 6‑digit code, and a new password.

Backend email links use `CLIENT_URL` (defaults to `http://localhost:3000`). Set it in the backend `.env` for production deployments.
