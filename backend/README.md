# ProdigiousHub Backend API 🚀

A powerful backend API for ProdigiousHub - the gamified project collaboration platform with Discord integration.

## 🔥 Features

- **JWT Authentication** with 30-day sessions
- **Email Verification** with beautiful HTML emails
- **Password Reset** functionality  
- **MySQL Database** with comprehensive schema
- **Gamification System** (XP, levels, achievements)
- **Rate Limiting & Security** with Helmet
- **Input Validation** with express-validator
- **Session Management** with database storage

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MySQL 8.0+
- Gmail account (for email service)

### Installation

1. **Clone and navigate to backend**
   ```bash
   cd backend
   npm install
   ```

2. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Configure MySQL Database**
   - Create a MySQL database named `prodigioushub`
   - Update DB credentials in `.env`

4. **Configure Email Service**
   - Enable 2FA on your Gmail account
   - Generate an App Password
   - Add email credentials to `.env`

5. **Start the Server**
   ```bash
   # Development with auto-reload
   npm run dev
   
   # Production
   npm start
   ```

## 📊 Database Schema

The API automatically creates these tables:

### Users
- Authentication & profile data
- Level, XP, and gamification stats
- Discord integration fields
- Email verification status

### Projects  
- Project details and status
- Creator and participant management
- XP rewards and difficulty levels
- Discord channel integration

### Achievements
- Achievement definitions
- User achievement tracking
- XP rewards and rarity system

### Sessions
- JWT token management
- Device and IP tracking
- Automatic cleanup of expired sessions

### Activity Feed
- Real-time activity tracking
- Project and user events
- Gamification events

## 🔐 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/verify-email` | Verify email address |
| POST | `/api/auth/resend-verification` | Resend verification email |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout user |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health status |
| GET | `/api` | API welcome message |

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - Prevent abuse
- **Input Validation** - Sanitize inputs
- **Password Hashing** - bcryptjs with salt rounds
- **JWT Security** - Signed tokens with expiry
- **Session Validation** - Database-backed sessions
- **CORS Protection** - Configured for frontend

## 🎮 Gamification System

### XP & Levels
- Users start at Level 1 with 0 XP
- XP requirements increase exponentially: `1000 * (1.5 ^ (level - 1))`
- Automatic level-up detection and rewards

### Achievement System
- Pre-loaded default achievements
- Custom achievement creation
- Rarity levels: Common, Rare, Epic, Legendary
- Automatic achievement checking

### Activity Tracking
- Real-time activity feed
- Project creation/completion events
- Level-up and achievement notifications
- Discord integration events

## 📧 Email Templates

Beautiful, responsive HTML email templates for:

### Verification Email
- Welcome message with branding
- One-click verification button
- Feature highlights
- Security information

### Password Reset
- Security-focused design
- One-time reset link
- Expiry information
- Safety instructions

## 🔧 Configuration

### Environment Variables

**Required:**
- `JWT_SECRET` - Strong secret for JWT signing
- `DB_PASSWORD` - MySQL password
- `EMAIL_USER` & `EMAIL_PASS` - Gmail credentials

**Optional:**
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode
- `FRONTEND_URL` - Frontend URL for CORS

### Rate Limiting
- Authentication: 5 attempts per 15 minutes
- Email sending: 3 emails per hour  
- General API: 100 requests per 15 minutes

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production database
4. Set up proper email service
5. Configure CORS for production frontend

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Validation errors (if any)
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

---

Built with ❤️ for the ProdigiousHub community 🎮
