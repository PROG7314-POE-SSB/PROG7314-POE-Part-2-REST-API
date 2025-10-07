# PantryChef REST API

A comprehensive Node.js REST API backend for the PantryChef recipe application, built with Express.js, Firebase integration, and Spoonacular API for recipe discovery.

## 🚀 Project Overview

PantryChef REST API is a full-featured backend service that powers the PantryChef mobile application. It provides user authentication, pantry management, recipe discovery with dietary preferences, and comprehensive health monitoring capabilities using Firebase as the backend service and Spoonacular API for recipe data.

## 👥 Project Team

This application was designed and developed by **SSB Digital (Group 2)**:

- **Sashveer Lakhan Ramjathan** (ST10361554)
- **Shravan Ramjathan** (ST10247982)
- **Blaise Mikka de Gier** (ST10249838)

## 📁 Project Structure

```
├── .env                         # Environment variables (not in repo)
├── .gitignore                   # Git ignore rules
├── app.js                       # Main application entry point
├── package.json                 # Project dependencies and scripts
├── controllers/
│   ├── healthController.js      # Health check endpoint controller
│   ├── pantyController.js       # Pantry CRUD operations controller
│   └── discoveryController.js   # Recipe discovery and search controller
├── middleware/
│   └── authMiddleware.js        # Firebase authentication middleware
├── models/
│   └── recipeModels.js          # Recipe data models and transformations
├── routes/
│   ├── authRoutes.js            # Authentication routes
│   ├── healthRoutes.js          # Health check routes
│   ├── pantryRoutes.js          # Pantry management routes
│   └── discoveryRoutes.js       # Recipe discovery and search routes
└── services/
    ├── firebase.js              # Firebase configuration and utilities
    └── spoonacularService.js    # Spoonacular API integration service
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Recipe API**: Spoonacular API 2.0.2
- **Development**: Nodemon for auto-reload
- **Tunneling**: @n8n/localtunnel for public URL access
- **Environment**: dotenv for secure configuration

## 📋 Dependencies

### Production Dependencies

- `express` - Web application framework
- `cors` - Cross-Origin Resource Sharing middleware
- `dotenv` - Environment variable loader
- `firebase` - Firebase client SDK
- `firebase-admin` - Firebase Admin SDK
- `spoonacular` - Spoonacular API integration
- `@n8n/localtunnel` - Creates secure tunnels to localhost

### Development Dependencies

- `nodemon` - Development server with auto-reload

## 🌐 Smart LocalTunnel Integration

### Intelligent Subdomain Allocation

The API features a **smart tunnel system** that automatically handles team development conflicts through a three-tier fallback approach:

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

## 👥 Team Development Strategy

### Perfect for Simultaneous Development

✅ **Multiple Developers**: Each team member gets their own unique tunnel URL  
✅ **Zero Conflicts**: Automatic fallback prevents subdomain collisions  
✅ **Predictable URLs**: Know your URL pattern in advance  
✅ **Easy Android Integration**: Consistent URL structure for mobile app configuration

### Team Coordination Made Simple

When you start the server, you'll see output like this:

```
🌍 Public URL: https://pantry-chef-sashveer.loca.lt
📱 Use this URL in your Android app: https://pantry-chef-sashveer.loca.lt

============================================================
👥 TEAM DEVELOPMENT INFO
============================================================
🔧 Your API: https://pantry-chef-sashveer.loca.lt
👤 Developer: sashveer
📝 To avoid conflicts, each team member should:
   1. Set unique DEVELOPER_NAME in .env file
   2. Use their personal tunnel URL in Android app
   3. Coordinate who runs the main 'pantry-chef' instance
============================================================
```

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
FIREBASE_PROJECT_ID=pantrychef-recipe-app
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key
SPOONACULAR_API_KEY=api_key_here
PORT=5000
NODE_ENV=development
DEVELOPER_NAME=your-unique-name  # Use your actual name (e.g., sashveer, shravan, blaise)
```

**Important Notes:**

- Replace `your-unique-name` with your actual name (lowercase, no spaces)
- Replace `api_key_here` with your actual Spoonacular API key
- Contact the team lead to get the actual Firebase and Spoonacular API credentials
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

When starting in development mode, you'll see comprehensive startup logs:

```
🚀 Server running on port: http://localhost:5000
📋 Project: pantrychef-recipe-app
🔍 Checking Firebase connection...
✅ All Firebase services are healthy
📊 Firestore: ✅ Connected
🔐 Auth: ✅ Connected
🧹 Test document cleaned up successfully
🌐 Setting up localtunnel...
👤 Developer: sashveer
🏷️  Attempting subdomain: pantry-chef-sashveer
✅ Successfully claimed subdomain: pantry-chef-sashveer
🌍 Public URL: https://pantry-chef-sashveer.loca.lt
📱 Use this URL in your Android app: https://pantry-chef-sashveer.loca.lt
⚠️  Keep this terminal open to maintain the tunnel
```

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

### Pantry Management

All pantry endpoints require authentication (`Authorization: Bearer <firebase-token>`):

#### Add Item

- **POST** `/api/pantry`
- **Body**:
  ```json
  {
    "title": "Milk",
    "description": "Whole milk 2L",
    "imageUrl": "https://supabase-url/image.jpg",
    "expiryDate": "2024-12-31",
    "quantity": 1,
    "category": "Dairy",
    "location": "fridge"
  }
  ```
- **Response**: `{ "message": "Item added successfully", "item": {...} }`

#### Get All Items

- **GET** `/api/pantry`
- **Response**:
  ```json
  {
    "pantry": [...items],
    "fridge": [...items],
    "freezer": [...items]
  }
  ```

#### Get Single Item

- **GET** `/api/pantry/:id`
- **Response**: `{ ...itemData }`

#### Update Item

- **PUT** `/api/pantry/:id`
- **Body**: Partial item data to update
- **Response**: `{ "message": "Item updated successfully" }`

#### Delete Item

- **DELETE** `/api/pantry/:id`
- **Response**: `{ "message": "Item deleted successfully" }`

### Recipe Discovery

All discovery endpoints require authentication (`Authorization: Bearer <firebase-token>`):

#### Get Random Recipes

- **GET** `/api/discovery/random`
- **Description**: Get personalized recipes based on user's dietary preferences and allergies
- **Response**:
  ```json
  {
    "message": "Random recipes retrieved successfully",
    "count": 10,
    "recipes": [
      {
        "recipeId": 123456,
        "title": "Delicious Recipe",
        "description": "A tasty recipe...",
        "imageUrl": "https://spoonacular.com/...",
        "servings": 4,
        "source": "Spoonacular API",
        "ingredients": [
          {
            "name": "Flour",
            "quantity": 2,
            "unit": "cups"
          }
        ],
        "instructions": [
          {
            "stepNumber": 1,
            "instruction": "Mix ingredients..."
          }
        ]
      }
    ]
  }
  ```

#### Search Recipes

- **POST** `/api/discovery/search`
- **Body**:
  ```json
  {
    "query": "chicken pasta"
  }
  ```
- **Description**: Search recipes with query, filtered by user preferences
- **Response**: Same format as random recipes with additional `query` field

#### Get Recipe Details

- **GET** `/api/discovery/recipe/:id`
- **Description**: Get detailed information about a specific recipe
- **Response**:
  ```json
  {
    "message": "Recipe information retrieved successfully",
    "recipeId": 123456,
    "recipe": { ...fullRecipeData }
  }
  ```

#### Get User Preferences (Debug)

- **GET** `/api/discovery/preferences`
- **Description**: Get user's dietary preferences and allergies for debugging
- **Response**:
  ```json
  {
    "message": "User preferences retrieved successfully",
    "preferences": {
      "allergies": { "dairy": false, "nuts": true, ... },
      "dietaryPreferences": { "vegan": false, "vegetarian": true, ... }
    }
  }
  ```

## 🔐 Authentication System

The API uses Firebase Authentication with JWT tokens. All protected endpoints require:

1. Include the Firebase ID token in the Authorization header
2. Format: `Authorization: Bearer <firebase-id-token>`

The [`verifyToken`](middleware/authMiddleware.js) middleware handles:

- Token extraction from headers
- Token validation with Firebase
- User data attachment to request object
- Error handling for invalid/missing tokens

## 🍽️ Recipe Discovery Features

### Smart Dietary Filtering

The recipe discovery system includes advanced filtering with fallback logic:

1. **Primary Filter**: Search with dietary preferences + allergies
2. **Fallback 1**: Search with only dietary preferences
3. **Fallback 2**: Search without any filters

### Supported Dietary Preferences

- **Vegan**: Plant-based recipes only
- **Vegetarian**: Vegetarian-friendly recipes
- **Gluten-Free**: Gluten-free options

### Supported Allergies

- **Dairy**: Excludes dairy products
- **Eggs**: Excludes egg-containing recipes
- **Nuts**: Excludes tree nuts and peanuts
- **Shellfish**: Excludes shellfish
- **Soy**: Excludes soy products
- **Wheat**: Excludes wheat-containing recipes

### Recipe Data Model

Each recipe returned by the API includes:

- **Basic Info**: ID, title, description, image, servings
- **Ingredients**: Name, quantity, unit for each ingredient
- **Instructions**: Step-by-step cooking instructions
- **Source**: Attribution to Spoonacular API

## 🗄️ Data Storage

### Firebase Firestore Structure

```
users/
  {userId}/
    onboarding: {
      allergies: { dairy: boolean, eggs: boolean, ... },
      dietaryPreferences: { vegan: boolean, vegetarian: boolean, ... },
      preferences: { language: string }
    }

pantry/
  {userId}/
    pantry/
      {itemId}: { title, description, quantity, category, ... }
    fridge/
      {itemId}: { title, description, quantity, category, ... }
    freezer/
      {itemId}: { title, description, quantity, category, ... }
```

## 🏥 Health Monitoring

The API includes comprehensive health checking:

### Firebase Health Check

- **Firestore Connection**: Tests read/write operations
- **Firebase Auth**: Validates authentication service
- **Startup Diagnostics**: Automatically runs on server start

### Spoonacular API Health

- **API Connectivity**: Verified during recipe requests
- **Error Handling**: Graceful fallbacks for API failures
- **Rate Limiting**: Managed through service layer

Health check results are logged with emoji indicators:

- ✅ Service healthy
- ❌ Service failed

## 🔍 Development Notes

### Key Technologies Integration

#### Firebase Services

- **Firestore**: Document database for user data and pantry items
- **Firebase Auth**: User authentication and authorization
- **Firebase Admin SDK**: Server-side Firebase operations

#### Spoonacular API Integration

- **Recipe Search**: Complex query with dietary filters
- **Random Recipes**: Personalized recipe discovery
- **Recipe Details**: Full recipe information retrieval
- **Smart Fallbacks**: Multiple filtering strategies for best results

#### LocalTunnel Features

- **Tunnel Monitoring**: Real-time status and request logging
- **Auto-Reconnection**: Automatic reconnection on tunnel failure
- **Graceful Shutdown**: Proper cleanup on server termination
- **Team Coordination**: Developer-specific subdomain allocation

### Code Architecture

#### Models

- **Recipe Models**: Structured data transformation from Spoonacular API
- **Ingredient Models**: Standardized ingredient representation
- **Instruction Models**: Step-by-step cooking instructions

#### Controllers

- **Discovery Controller**: Recipe search and retrieval logic
- **Pantry Controller**: CRUD operations for pantry management
- **Health Controller**: Simple status endpoint

#### Services

- **Spoonacular Service**: Complete API integration with fallback logic
- **Firebase Service**: Database operations and health monitoring

## 🚫 Git Ignored Files

The following files/directories are excluded from version control:

- `node_modules/` - NPM dependencies
- `.env` - Environment variables (contains sensitive API keys and Firebase credentials)
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

4. **Configure Android App**: Use your tunnel URL in the mobile app

### Team Coordination

- 🔄 **Keep terminal open** to maintain tunnel connection
- 🆔 **Use unique DEVELOPER_NAME** to avoid conflicts
- 💬 **Communicate** API changes with team members
- 🔧 **Test locally first** before using tunnel for integration
- 📱 **Share tunnel URLs** for cross-platform testing

## 🚨 Troubleshooting Guide

### Common Issues and Solutions

1. **Subdomain Conflicts**:

   ```
   ⚠️ Subdomain 'pantry-chef-sashveer' not available, trying fallback...
   ```

   - **Normal behavior** - system automatically tries alternatives
   - Check console for your final tunnel URL

2. **Firebase Connection Issues**:

   ```
   ❌ All Firebase services are not healthy
   ```

   - Verify `.env` file has correct Firebase credentials
   - Check Firebase project status and permissions
   - Contact team lead for credential verification

3. **Spoonacular API Issues**:

   ```
   Spoonacular API error: Request failed
   ```

   - Check `SPOONACULAR_API_KEY` in `.env` file
   - Verify API quota hasn't been exceeded
   - Test with simpler queries first

4. **Pantry Operations Failing**:
   ```
   Error: User not found / Failed to fetch pantry items
   ```
   - Ensure Firebase ID token is valid and included in headers
   - Check user exists in Firebase Auth
   - Verify user has completed onboarding process

## 🎯 Quick Start for SSB Digital Team

1. **Get credentials** from Sashveer (team lead)
2. **Set DEVELOPER_NAME** to your name in `.env` (sashveer, shravan, or blaise)
3. **Run `npm run dev`**
4. **Copy tunnel URL** from console
5. **Use tunnel URL** in your Android app
6. **Start developing!** 🚀

Your tunnel URL will be predictable: `https://pantry-chef-{yourname}.loca.lt`

## 📚 API Documentation Summary

| Endpoint                     | Method | Purpose              | Auth Required |
| ---------------------------- | ------ | -------------------- | ------------- |
| `/`                          | GET    | Health check         | No            |
| `/api/auth/me`               | GET    | Get user info        | Yes           |
| `/api/pantry`                | POST   | Add pantry item      | Yes           |
| `/api/pantry`                | GET    | Get all items        | Yes           |
| `/api/pantry/:id`            | GET    | Get single item      | Yes           |
| `/api/pantry/:id`            | PUT    | Update item          | Yes           |
| `/api/pantry/:id`            | DELETE | Delete item          | Yes           |
| `/api/discovery/random`      | GET    | Get random recipes   | Yes           |
| `/api/discovery/search`      | POST   | Search recipes       | Yes           |
| `/api/discovery/recipe/:id`  | GET    | Get recipe details   | Yes           |
| `/api/discovery/preferences` | GET    | Get user preferences | Yes           |

## 🏆 Features Overview

- ✅ **Complete Authentication** with Firebase
- ✅ **Pantry Management** across 3 locations (pantry, fridge, freezer)
- ✅ **Smart Recipe Discovery** with dietary preferences and allergy filtering
- ✅ **Recipe Search** with fallback strategies
- ✅ **Detailed Recipe Information** with ingredients and instructions
- ✅ **Health Monitoring** for all services
- ✅ **Team-Friendly Development** with smart tunnel allocation
- ✅ **Comprehensive Error Handling** with meaningful messages
- ✅ **Production-Ready** with environment-based configuration

---

**Developed with ❤️ by SSB Digital (Group 2) for PROG7314 POE Part 2**
