# Authentication Setup Guide

This application integrates with Skillgenie database for user authentication and subscription verification. Only users with valid 3 or 6 month Skillgenie subscriptions can access the application.

## Features

- ✅ Login with Skillgenie email or username (from database)
- ✅ Subscription verification from payment history (3 or 6 months only)
- ✅ Protected routes - only authenticated users can access
- ✅ JWT token-based authentication
- ✅ Automatic session management
- ✅ Subscription expiration checking

## Backend Setup

### 1. Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration (Skillgenie Database)
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASS=your_db_password
DB_PORT=5432
DB_SSL=false

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Skillgenie Database Table Names (Optional - defaults provided)
# Users table configuration
SKILLGENIE_USERS_TABLE=users
SKILLGENIE_EMAIL_COLUMN=email
# Optional: set if you have a username column and want username login support
# SKILLGENIE_USERNAME_COLUMN=username
SKILLGENIE_PASSWORD_COLUMN=password
SKILLGENIE_ID_COLUMN=id

# Payments/Subscriptions table configuration
SKILLGENIE_PAYMENTS_TABLE=payments
SKILLGENIE_SUBSCRIPTIONS_TABLE=subscriptions
SKILLGENIE_USER_ID_COLUMN=user_id
SKILLGENIE_AMOUNT_COLUMN=amount
SKILLGENIE_DURATION_COLUMN=duration
SKILLGENIE_PLAN_TYPE_COLUMN=plan_type
SKILLGENIE_STATUS_COLUMN=status
SKILLGENIE_PAYMENT_DATE_COLUMN=payment_date
SKILLGENIE_START_DATE_COLUMN=start_date
SKILLGENIE_END_DATE_COLUMN=end_date

# Server Port
PORT=5000
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Database Setup

The application will automatically create the `users` table on first run. Make sure your PostgreSQL database is running and accessible.

## Frontend Setup

### 1. Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

If not set, it defaults to `http://localhost:5000`.

### 2. Install Dependencies

```bash
npm install
```

## Skillgenie Database Schema

The authentication system queries the Skillgenie database directly. It expects the following tables:

### Users Table
The system looks for a users table with:
- `email` (or configured column name) - User email address
- `username` (optional column) - Skillgenie username for login via username
- `password` (or configured column name) - Bcrypt hashed password
- `id` (or configured column name) - User ID

**Example:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);
```

### Payments/Subscriptions Table
The system checks for subscription information in either:
1. A `subscriptions` table with plan_type, start_date, end_date, status
2. A `payments` table with plan_type/duration, payment_date, status

**Example Subscriptions Table:**
```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  plan_type VARCHAR(50), -- e.g., "3months", "6months"
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status VARCHAR(50) -- e.g., "active", "completed", "paid"
);
```

**Example Payments Table:**
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  plan_type VARCHAR(50), -- or use duration column
  duration INTEGER, -- 3 or 6 months
  payment_date TIMESTAMP,
  status VARCHAR(50), -- "completed", "paid", etc.
  amount DECIMAL
);
```

### Customizing Table/Column Names

If your Skillgenie database uses different table or column names, set the corresponding environment variables in `.env`. The system will automatically use your custom names.

## Running the Application

### Backend
```bash
cd backend
npm start
# or for development
npm run dev
```

### Frontend
```bash
npm start
```

## How It Works

1. **User Login**: User enters Skillgenie email and password
2. **Credential Verification**: Backend verifies credentials with Skillgenie API
3. **Subscription Check**: Backend retrieves and verifies subscription:
   - Must be 3 or 6 months subscription
   - Must be active
   - Must not be expired
4. **Token Generation**: If valid, JWT token is generated and returned
5. **Session Management**: Token is stored in localStorage and included in all API requests
6. **Route Protection**: All protected routes check for valid token and subscription

## Protected Routes

All chat routes (`/api/chat/*`) require authentication. The middleware checks:
- Valid JWT token
- Active subscription
- Subscription type (3 or 6 months)
- Subscription not expired

## Logout

Users can logout using the logout button in the header. This clears the token and redirects to the login page.

## Troubleshooting

### "Invalid email or password"
- Check Skillgenie API credentials
- Verify API endpoint URLs are correct
- Check network connectivity

### "Access denied. Valid 3 or 6 month subscription required."
- User's subscription is not 3 or 6 months
- Subscription type doesn't match expected format

### "Your subscription has expired"
- User's subscription end date has passed
- User needs to renew subscription

### Database connection errors
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

## Security Notes

⚠️ **IMPORTANT**: 
- Change `JWT_SECRET` in production
- Use HTTPS in production
- Store API keys securely
- Never commit `.env` files to version control

