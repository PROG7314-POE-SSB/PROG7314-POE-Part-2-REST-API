# PantryChef REST API

A Node.js REST API backend for the PantryChef recipe application, built with Express.js and Firebase integration.

## 🚀 Project Overview

This is the backend API for PantryChef, a recipe management application. The API provides authentication services and health monitoring capabilities using Firebase as the backend service.

## 📁 Project Structure

```
├── .env                      # Environment variables (not in repo)
├── .gitignore               # Git ignore rules
├── app.js                   # Main application entry point
├── package.json             # Project dependencies and scripts
├── controllers/
│   └── healthController.js  # Health check endpoint controller
├── middleware/
│   └── authMiddleware.js    # Firebase authentication middleware
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   └── healthRoutes.js      # Health check routes
└── services/
    └── firebase.js          # Firebase configuration and utilities
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Development**: Nodemon for auto-reload

## 📋 Dependencies

### Production Dependencies

- `express` - Web application framework
- `cors` - Cross-Origin Resource Sharing middleware
- `dotenv` - Environment variable loader
- `firebase` - Firebase client SDK
- `firebase-admin` - Firebase Admin SDK

### Development Dependencies

- `nodemon` - Development server with auto-reload

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/PROG7314-POE-SSB/PROG7314-POE-Part-2-REST-API.git
cd PROG7314-POE-Part-2-REST-API
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Environment File

Create a `.env` file in the root directory with the following variables:

```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key
PORT=5000
```

**Note**: Contact the team lead to get the actual Firebase credentials.

### 4. Start the Server

#### Development Mode (with auto-reload):

```bash
npm run dev
```

#### Production Mode:

```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## 🛣️ API Endpoints

### Health Check

- **GET** `/` - Returns API status
  - Response: `"PantryChef API running!"`

### Authentication

- **GET** `/api/auth/me` - Get current user info (requires authentication)
  - Headers: `Authorization: Bearer <firebase-token>`
  - Response: `{ "user": { ...userInfo } }`

## 🔐 Authentication

The API uses Firebase Authentication with JWT tokens. Protected endpoints require:

1. Include the Firebase ID token in the Authorization header
2. Format: `Bearer <firebase-id-token>`

The [`verifyToken`](middleware/authMiddleware.js) middleware handles token validation and user extraction.

## 🏥 Health Monitoring

The API includes comprehensive Firebase health checking:

- **Firestore Connection**: Tests read/write operations
- **Firebase Auth**: Validates authentication service
- **Startup Diagnostics**: Automatically runs health checks on server start

Health check results are logged to the console with emoji indicators:

- ✅ Service healthy
- ❌ Service failed

## 🔍 Development Notes

### Firebase Services Used

- **Firestore**: Document database for storing recipes and user data
- **Firebase Auth**: User authentication and authorization
- **Firebase Admin SDK**: Server-side Firebase operations

### Key Files Explanation

- [`app.js`](app.js): Main application entry point with server setup and Firebase health checking
- [`services/firebase.js`](services/firebase.js): Firebase configuration and health check utilities
- [`middleware/authMiddleware.js`](middleware/authMiddleware.js): JWT token verification middleware
- [`controllers/healthController.js`](controllers/healthController.js): Health endpoint controller
- [`routes/`](routes/): Route definitions for different API endpoints

## 🚫 Git Ignored Files

The following files/directories are excluded from version control:

- `node_modules/` - NPM dependencies
- `.env` - Environment variables
- Log files and temporary files
- IDE-specific files

## 📝 Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (not implemented yet)

## 🤝 Team Collaboration

1. **After cloning**: Always run `npm install` to install dependencies
2. **Environment setup**: Create your own `.env` file with the provided credentials
3. **Development**: Use `npm run dev` for development with auto-reload
4. **Before committing**: Ensure `.env` file is not committed to the repository
