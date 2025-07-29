# 🚀 ProdigiousHub

**A collaborative platform for developers to create, manage, and showcase projects with gamification and Discord integration.**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## ✨ Features

### 🎯 Core Features
- **Project Management** - Create, collaborate, and manage development projects
- **User Profiles** - Customizable profiles with skills, portfolio links, and achievements
- **Real-time Collaboration** - Work together on projects with team management
- **Discord Integration** - Automatic Discord server/channel creation for projects
- **Gamification System** - XP, levels, achievements to motivate developers

### 🎮 Gamification
- **XP System** - Earn experience points for completing projects and activities
- **Leveling System** - Progress through developer levels with visual indicators
- **Achievements** - Unlock badges for various milestones and accomplishments
- **Activity Feed** - Real-time feed of platform activities and achievements

### 🔗 Integrations
- **Discord Bot** - Automatic server management and role assignment
- **Email Notifications** - Account verification and project updates
- **GitHub Integration** - Link repositories to projects
- **Social Features** - LinkedIn, portfolio, and social profile connections

## 🏗️ Tech Stack

### Frontend (`/frontend`)
- **React 18** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Framer Motion** - Smooth animations and transitions
- **Heroicons** - Beautiful SVG icons

### Backend (`/backend`)
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **MySQL2** - MySQL client with Promise support
- **JWT** - JSON Web Token authentication
- **Discord.js** - Discord bot integration
- **Nodemailer** - Email service integration
- **bcrypt** - Password hashing

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MySQL 8.0+
- Discord Bot Token (for Discord integration)
- Gmail App Password (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/InfernusReal/ProdigiousHub-V3.git
   cd ProdigiousHub-V3
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment Setup**
   
   Create `backend/.env` file:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=3001
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=ProdigiousHub
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=30d
   
   # Email (Gmail SMTP)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   
   # Discord Integration
   DISCORD_CLIENT_ID=your_discord_client_id
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   DISCORD_BOT_TOKEN=your_discord_bot_token
   DISCORD_GUILD_ID=your_discord_guild_id
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

4. **Database Setup**
   ```bash
   # Create MySQL database
   mysql -u root -p
   CREATE DATABASE ProdigiousHub;
   exit
   
   # Tables will be created automatically when you start the backend
   ```

5. **Start Development Servers**
   
   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm start
   # Server runs on http://localhost:5000
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   # App runs on http://localhost:5173
   ```

## 📁 Project Structure

```
ProdigiousHub/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Auth/        # Authentication components
│   │   │   ├── Dashboard/   # Dashboard components
│   │   │   ├── Discord/     # Discord integration
│   │   │   ├── HomePage/    # Landing page components
│   │   │   ├── Profile/     # User profile components
│   │   │   ├── Projects/    # Project management
│   │   │   └── shared/      # Shared/common components
│   │   ├── contexts/        # React context providers
│   │   ├── utils/           # Utility functions
│   │   └── assets/          # Static assets
│   ├── public/              # Public assets
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── routes/              # API route handlers
│   ├── middleware/          # Express middleware
│   ├── services/            # Business logic services
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   ├── scripts/             # Database scripts
│   └── server.js            # Express server entry point
├── package.json             # Root package.json (monorepo)
└── README.md               # This file
```

## 🛠️ Available Scripts

### Root Level
```bash
npm install          # Install all dependencies
npm run dev         # Start both frontend and backend
```

### Frontend (`/frontend`)
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

### Backend (`/backend`)
```bash
npm start           # Start development server
npm run prod        # Start production server
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Email verification
- `GET /api/auth/discord` - Discord OAuth
- `POST /api/auth/discord/disconnect` - Disconnect Discord

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:slug` - Get project by slug
- `PUT /api/projects/:id` - Update project
- `POST /api/projects/:id/join` - Join project
- `POST /api/projects/:id/leave` - Leave project

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/dashboard` - Get dashboard data
- `GET /api/users/level` - Get user level info

## 🚀 Deployment

### Frontend (AWS Amplify)
1. Connect your GitHub repository to AWS Amplify
2. Set build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/dist
       files:
         - '**/*'
   ```

### Backend (AWS Lambda/EC2)
1. **Environment Variables**: Set all environment variables in your deployment platform
2. **Database**: Use AWS RDS MySQL instance
3. **Build**: The backend is ready for deployment as-is

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Discord.js** - For Discord bot integration
- **Heroicons** - For beautiful SVG icons

## 📧 Contact

**InfernusReal** - [@InfernusReal](https://github.com/InfernusReal)

Project Link: [https://github.com/InfernusReal/ProdigiousHub-V3](https://github.com/InfernusReal/ProdigiousHub-V3)

---

**Built with ❤️ for developers, by developers**
