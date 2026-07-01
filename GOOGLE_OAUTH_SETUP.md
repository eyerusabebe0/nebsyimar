# Google OAuth Setup Guide for Nefsyimar

This guide explains how to set up Google OAuth authentication for the Nefsyimar platform.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. A project in Google Cloud Console

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen if prompted:
   - Application type: External (for development)
   - Application name: Nefsyimar
   - User support email: Your email
   - Developer contact information: Your email
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: Nefsyimar Web Client
   - Authorized JavaScript origins:
     - `http://localhost:4000`
     - `http://localhost:3000` (backup)
   - Authorized redirect URIs:
     - `http://localhost:4000/auth/google/callback`

## Step 2: Configure Environment Variables

### Backend (.env file)
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:4000/auth/google/callback
```

### Frontend (.env.local file)
```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-google-client-id.googleusercontent.com
```

**Important**: Replace `your-actual-google-client-id` and `your-actual-google-client-secret` with the actual values from Google Cloud Console.

## Step 3: Database Migration

The User model has been updated to support Google OAuth. Run the following to update your database:

```bash
cd nefsyimar-backend
npm run migrate
```

Or if using development mode, the database will auto-sync when you restart the server.

## Step 4: Test the Integration

1. Start the backend server:
   ```bash
   cd nefsyimar-backend
   npm start
   ```

2. Start the frontend server:
   ```bash
   cd nefsyimar-frontend
   npm start
   ```

3. Navigate to `http://localhost:4000/auth/login`
4. You should see a "Sign in with Google" button
5. Click it to test the Google OAuth flow

## Features Added

### Frontend
- ✅ Google Sign-In component (`GoogleSignIn.tsx`)
- ✅ Integration in login page (`/auth/login`)
- ✅ Integration in register page (`/auth/register`)
- ✅ Updated AuthContext to handle Google authentication
- ✅ Environment variable configuration

### Backend
- ✅ Google OAuth routes (`POST /api/v1/auth/google`, `GET /api/v1/auth/google/url`)
- ✅ Google OAuth controller methods
- ✅ Updated User model with `google_id` field
- ✅ Google Auth Library integration
- ✅ Environment variable configuration

## How It Works

1. **Frontend**: User clicks "Sign in with Google" button
2. **Google**: Google Identity Services loads and shows OAuth popup
3. **User**: User authenticates with Google and grants permissions
4. **Google**: Returns JWT credential to frontend
5. **Frontend**: Sends credential to backend `/api/v1/auth/google` endpoint
6. **Backend**: Verifies credential with Google, creates/updates user, returns JWT token
7. **Frontend**: Stores token and updates authentication state

## Security Features

- ✅ JWT token verification with Google
- ✅ Secure credential handling
- ✅ CORS protection
- ✅ User data validation
- ✅ Automatic wallet creation for new users
- ✅ Email verification bypass for Google accounts (pre-verified)

## Troubleshooting

### Common Issues

1. **"Google Sign-In is not configured"**: 
   - Check that `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env.local`
   - Restart the frontend server after adding environment variables

2. **"Invalid Google token"**:
   - Verify `GOOGLE_CLIENT_ID` matches in both frontend and backend
   - Check that the domain is authorized in Google Cloud Console

3. **CORS errors**:
   - Ensure `http://localhost:4000` is in authorized origins
   - Check backend CORS configuration includes port 4000

4. **Database errors**:
   - Run database migration to add `google_id` column
   - Check that User model validation allows null passwords for Google users

### Testing Checklist

- [ ] Google Sign-In button appears on login page
- [ ] Google Sign-In button appears on register page
- [ ] Clicking button opens Google OAuth popup
- [ ] Successful authentication redirects to dashboard
- [ ] User data is saved correctly in database
- [ ] Wallet is created for new Google users
- [ ] Existing users can link Google account

## Production Deployment

For production deployment:

1. Update authorized origins and redirect URIs in Google Cloud Console
2. Update environment variables with production URLs
3. Ensure HTTPS is used for all Google OAuth interactions
4. Set up proper domain verification in Google Cloud Console

## Support

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Check backend logs for server errors
3. Verify all environment variables are set correctly
4. Ensure Google Cloud Console configuration matches your setup
