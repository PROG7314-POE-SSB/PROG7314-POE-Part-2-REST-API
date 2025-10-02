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
- **Tunneling**: @n8n/localtunnel for public URL access

## 📋 Dependencies

### Production Dependencies

- `express` - Web application framework
- `cors` - Cross-Origin Resource Sharing middleware
- `dotenv` - Environment variable loader
- `firebase` - Firebase client SDK
- `firebase-admin` - Firebase Admin SDK
- `@n8n/localtunnel` - Creates secure tunnels to localhost

### Development Dependencies

- `nodemon` - Development server with auto-reload

## 🌐 Smart LocalTunnel Integration

### Intelligent Subdomain Allocation

The API now features a **smart tunnel system** that automatically handles team development conflicts through a three-tier fallback approach:

#### 🎯 Tier 1: Developer-Specific Subdomains

```
Pattern: pantry-chef-{DEVELOPER_NAME}
Example: https://pantry-chef-sashveer.loca.lt
```

#### 🎯 Tier 2: Port-Enhanced Fallback

```
Pattern: pantry-chef-{DEVELOPER_NAME}-{PORT}
Example: https://pantry-chef-sashveer-5000.loca.lt
```

#### 🎯 Tier 3: Random Subdomain Safety Net

```
Pattern: Random alphanumeric
Example: https://abc123def.loca.lt
```

### How the Smart System Works

1. **Primary Attempt**: Uses `pantry-chef-{your-name}` subdomain
2. **Conflict Detection**: If subdomain is taken, tries port-enhanced version
3. **Ultimate Fallback**: If both fail, gets random subdomain
4. **Automatic Logging**: Shows which tier was successful and provides team coordination info

### Implementation Details

```javascript
// Environment-based subdomain generation
const developerName = process.env.DEVELOPER_NAME || "dev";
const subdomain = `pantry-chef-${developerName}`;

// Three-tier fallback system
try {
  // Tier 1: Developer-specific
  tunnel = await localtunnel({ port: PORT, subdomain: subdomain });
} catch (subdomainError) {
  try {
    // Tier 2: Port-enhanced
    const fallbackSubdomain = `pantry-chef-${developerName}-${PORT}`;
    tunnel = await localtunnel({ port: PORT, subdomain: fallbackSubdomain });
  } catch (fallbackError) {
    // Tier 3: Random
    tunnel = await localtunnel({ port: PORT });
  }
}
```

## 👥 Team Development Strategy

### Perfect for Simultaneous Development

✅ **Multiple Developers**: Each team member gets their own unique tunnel URL  
✅ **Zero Conflicts**: Automatic fallback prevents subdomain collisions  
✅ **Predictable URLs**: Know your URL pattern in advance  
✅ **Easy Android Integration**: Consistent URL structure for mobile app configuration

### Team Coordination Made Simple

When you start the server, you'll see output like this:

```
🌍 Public URL: https://pantry-chef-john.loca.lt
📱 Use this URL in your Android app: https://pantry-chef-john.loca.lt

============================================================
👥 TEAM DEVELOPMENT INFO
============================================================
🔧 Your API: https://pantry-chef-john.loca.lt
👤 Developer: john
📝 To avoid conflicts, each team member should:
   1. Set unique DEVELOPER_NAME in .env file
   2. Use their personal tunnel URL in Android app
   3. Coordinate who runs the main 'pantry-chef' instance
============================================================
```

### Recommended Team Setup

#### Option A: Individual Development (Recommended)

Each team member works with their own API instance:

```env
# john's .env
DEVELOPER_NAME=john
# Gets: https://pantry-chef-john.loca.lt

# sarah's .env
DEVELOPER_NAME=sarah
# Gets: https://pantry-chef-sarah.loca.lt

# mike's .env
DEVELOPER_NAME=mike
# Gets: https://pantry-chef-mike.loca.lt
```

**Benefits:**

- 🚀 **Parallel Development**: Everyone can code simultaneously
- 🔒 **Isolated Testing**: No interference between team members
- 🎯 **Personal Control**: Full control over your API instance
- 📱 **Mobile Testing**: Each Android developer tests against their own API

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
NODE_ENV=development
DEVELOPER_NAME=your-unique-name  # 🔑 KEY: Use your actual name (e.g., john, sarah, mike)
```

**Important Notes:**

- Replace `your-unique-name` with your actual name (lowercase, no spaces)
- Contact the team lead to get the actual Firebase credentials
- Each team member should use a different `DEVELOPER_NAME`

### 4. Start the Server

#### Development Mode (with auto-reload and smart tunnel):

```bash
npm run dev
```

#### Production Mode (no tunnel):

```bash
npm start
```

### 5. Expected Output

When starting in development mode, you'll see:

```
🚀 Server running on port: http://localhost:5000
📋 Project: pantrychef-recipe-app
🔍 Checking Firebase connection...
✅ All Firebase services are healthy
📊 Firestore: ✅ Connected
🔐 Auth: ✅ Connected
🧹 Test document cleaned up successfully
🌐 Setting up localtunnel...
👤 Developer: john
🏷️  Attempting subdomain: pantry-chef-john
✅ Successfully claimed subdomain: pantry-chef-john
🌍 Public URL: https://pantry-chef-john.loca.lt
📱 Use this URL in your Android app: https://pantry-chef-john.loca.lt
⚠️  Keep this terminal open to maintain the tunnel
```

### 6. Update Android App

Use the tunnel URL provided in the console output in your Android application.

## 🛣️ API Endpoints

### Health Check

- **GET** `/` - Returns API status
  - **Local**: `http://localhost:5000/`
  - **Tunnel**: `https://pantry-chef-{your-name}.loca.lt/`
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

### LocalTunnel Advanced Features

#### Tunnel Monitoring

- **Connection Status**: Real-time tunnel status monitoring
- **Request Logging**: See incoming requests in console
- **Auto-Reconnection**: Automatic reconnection on tunnel failure
- **Graceful Shutdown**: Proper cleanup on server termination

#### Tunnel Events

```javascript
tunnel.on("close", () => console.log("🔴 Tunnel closed"));
tunnel.on("error", (err) => console.error("❌ Tunnel error:", err));
tunnel.on("request", (info) =>
  console.log(`📡 Request: ${info.method} ${info.path}`)
);
```

#### Fallback Scenarios

| Scenario               | Primary               | Fallback 1                 | Fallback 2           |
| ---------------------- | --------------------- | -------------------------- | -------------------- |
| **Available**          | `pantry-chef-john`    | -                          | -                    |
| **Conflict**           | `pantry-chef-john` ❌ | `pantry-chef-john-5000`    | -                    |
| **Multiple Conflicts** | `pantry-chef-john` ❌ | `pantry-chef-john-5000` ❌ | `abc123def` (random) |

### Key Files Explanation

- [`app.js`](app.js): Main application entry point with smart tunnel setup and Firebase health checking
- [`services/firebase.js`](services/firebase.js): Firebase configuration and health check utilities
- [`middleware/authMiddleware.js`](middleware/authMiddleware.js): JWT token verification middleware
- [`controllers/healthController.js`](controllers/healthController.js): Health endpoint controller
- [`routes/`](routes/): Route definitions for different API endpoints

## 🚫 Git Ignored Files

The following files/directories are excluded from version control:

- `node_modules/` - NPM dependencies
- `.env` - Environment variables (contains sensitive Firebase credentials)
- Log files and temporary files
- IDE-specific files

## 📝 Scripts

- `npm start` - Start the production server (no tunnel)
- `npm run dev` - Start development server with nodemon and smart tunnel

## 🤝 Team Collaboration Best Practices

### For New Team Members

1. **Clone and Setup**:

   ```bash
   git clone <repo-url>
   cd PROG7314-POE-Part-2-REST-API
   npm install
   ```

2. **Create Personal Environment**:

   ```bash
   # Copy provided .env template
   # Set your unique DEVELOPER_NAME
   DEVELOPER_NAME=yourname  # Use your actual name
   ```

3. **Start Development**:

   ```bash
   npm run dev
   ```

4. **Note Your Tunnel URL**: The console will show your personal tunnel URL

5. **Configure Android App**: Use your tunnel URL in the mobile app

### Team Coordination

- 🔄 **Keep terminal open** to maintain tunnel connection
- 🆔 **Use unique DEVELOPER_NAME** to avoid conflicts
- 💬 **Communicate** when switching between shared/individual development
- 🔧 **Test locally first** before using tunnel for team integration

### Troubleshooting Guide

#### Common Issues and Solutions

1. **Subdomain Conflicts**:

   ```
   ⚠️ Subdomain 'pantry-chef-john' not available, trying fallback...
   ```

   - **Normal behavior** - the system will automatically try alternatives
   - Check console for your final tunnel URL

2. **Tunnel Connection Failed**:

   ```
   ❌ Failed to create tunnel: connect ECONNREFUSED
   ```

   - Check internet connection
   - Try different `DEVELOPER_NAME`
   - Server still works locally on `localhost:5000`

3. **Firebase Connection Issues**:

   ```
   ❌ All Firebase services are not healthy
   ```

   - Verify `.env` file has correct Firebase credentials
   - Check Firebase project status
   - Contact team lead for credential verification

4. **Tunnel Disconnection**:
   ```
   🔴 Tunnel closed
   💡 Attempting to reconnect...
   ```
   - **Auto-reconnection** is built-in
   - If persistent, restart the server
   - Check network stability

### Production Deployment

When deploying to production:

1. Set `NODE_ENV=production` to disable tunneling
2. Use proper production environment variables
3. Configure production CORS settings
4. Set up proper SSL certificates

## 🎯 Quick Start for Team Members

1. **Get credentials** from team lead
2. **Set DEVELOPER_NAME** to your name in `.env`
3. **Run `npm run dev`**
4. **Copy tunnel URL** from console
5. **Use tunnel URL** in your Android app
6. **Start coding!** 🚀

Your tunnel URL will be predictable: `https://pantry-chef-{yourname}.loca.lt`
