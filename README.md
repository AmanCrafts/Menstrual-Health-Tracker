<div align="center">
  <img src="frontend/public/parllel-logo.png" alt="FlowSync Logo" width="200"/>
  
  # 🌸 FlowSync - Menstrual Health Tracker
  
  ### Empowering reproductive health through intelligent tracking and insights
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?logo=mongodb)](https://www.mongodb.com/)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

**FlowSync** is a comprehensive, full-stack menstrual health tracking platform that empowers users to monitor, analyze, and understand their reproductive health through data-driven insights. Built with modern web technologies, FlowSync combines intelligent cycle predictions, symptom monitoring, mood tracking, and personalized wellness analytics to provide a holistic view of menstrual health.

### 🎯 Why FlowSync?

- Health-First Approach: Wellness scoring based on actual health metrics, not just tracking frequency
- Intelligent Predictions: Machine learning-powered cycle predictions using historical data
- Comprehensive Analytics: Detailed insights into cycle regularity, symptoms, and mood patterns
- Privacy-Focused: Secure authentication with data encryption and user-controlled storage
- Educational Resources: Built-in guides about menstrual health, PMS management, and product selection
- Responsive Design: Seamless experience across desktop, tablet, and mobile devices

## ✨ Features

### 🩺 Core Health Tracking

- Period Logging: Track menstrual cycle start/end dates with flow intensity
- Cycle Predictions: AI-powered predictions for next period, ovulation, and fertile window
- Symptom Monitoring: Log 15+ common symptoms (cramps, headaches, fatigue, etc.)
- Mood Tracking: Monitor emotional health throughout your cycle
- Health Metrics: Track temperature, weight, and other vital health indicators

### 📊 Analytics & Insights

- Wellness Score: Health-based scoring system (0-100) evaluating:
  - Cycle regularity and hormonal balance
  - Cycle and period length normalcy
  - Symptom burden severity
  - Emotional health patterns
- Cycle Statistics: Average cycle length, regularity analysis, and trend visualization
- Symptom Analysis: Frequency charts and pattern identification
- Mood Patterns: Emotional health tracking across cycle phases

### 🎨 User Experience

- Interactive Dashboard: Real-time cycle status with visual progress indicators
- Calendar View: Month-by-month visualization of periods and logs
- Quick BMI Calculator: Instant BMI calculation with health categorization
- Test Mode: Explore the app with pre-populated sample data
- Responsive Design: Optimized for mobile, tablet, and desktop

### 📚 Education Hub

- Understanding Your Cycle: Comprehensive guide to menstrual phases
- PMS Management: Evidence-based tips for symptom relief
- Product Guide: Information on menstrual products and sustainability

### 🔐 Security & Privacy

- JWT Authentication: Secure token-based authentication system
- Password Hashing: bcrypt encryption for user credentials
- HTTP-Only Cookies: Protection against XSS attacks
- Rate Limiting: DDoS and brute-force attack prevention
- Input Validation: Comprehensive validation to prevent injection attacks

## 🛠 Tech Stack

### Frontend

| Technology   | Purpose                                    |
| ------------ | ------------------------------------------ |
| Node.js 18+  | JavaScript runtime environment             |
| JWT          | Secure authentication with JSON Web Tokens |
| bcryptjs     | Password hashing and encryption            |


| Technology             | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| **ESLint**             | Code quality and consistency enforcement |
| **Prettier**           | Automatic code formatting                |
| **Helmet**             | Security headers and protection          |
| **Morgan**             | HTTP request logging                     |
| **Winston**            | Application-level logging                |
| **Express Validator**  | Request validation middleware            |
| **Express Rate Limit** | API rate limiting                        |


### API Architecture

- **RESTful API** design principles
- **JWT-based authentication** with refresh tokens
- **Role-based access control** (RBAC) ready
- **Comprehensive error handling** with custom error classes
- **Request validation** at controller level

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org/))
- **MongoDB** 5.0+ ([Installation Guide](https://docs.mongodb.com/manual/installation/))
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AmanCrafts/Menstrual-Health-Tracker.git
   cd Menstrual-Health-Tracker
   ```

2. **Install Backend Dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**

   **Backend** - Create `backend/.env`:

   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/flowsync

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
   JWT_REFRESH_SECRET=your_refresh_token_secret_here
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d

   # CORS Configuration
   CLIENT_URL=http://localhost:5173
   ```

   **Frontend** - Create `frontend/.env`:

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

5. **Start MongoDB**

   ```bash
   # macOS (Homebrew)
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Windows
   net start MongoDB
   ```

6. **Seed Database (Optional)**

   ```bash
   cd backend
   npm run seed
   ```

7. **Start Development Servers**

   **Terminal 1 - Backend:**

   ```bash
   cd backend
   npm run dev
   ```

   Backend runs on `http://localhost:5000`

   **Terminal 2 - Frontend:**

   ```bash
   cd frontend
   npm run dev
   ```

   Frontend runs on `http://localhost:5173`

8. **Access the Application**

   Open your browser and navigate to `http://localhost:5173`

### 🎯 Test Mode

Want to explore without creating an account? Enable **Test Mode** from the login page to use pre-populated sample data and explore all features instantly!

---

## 📁 Project Structure

```
MHT/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   ├── database.js    # MongoDB connection setup
│   │   │   └── index.js       # Central config exports
│   │   ├── controllers/       # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── periodController.js
│   │   │   ├── symptomController.js
│   │   │   ├── moodController.js
│   │   │   └── healthController.js
│   │   ├── middleware/        # Custom middleware
│   │   │   ├── auth.js        # JWT verification
│   │   │   └── errorHandler.js
│   │   ├── models/            # MongoDB schemas
│   │   │   ├── User.js
│   │   │   ├── PeriodLog.js
│   │   │   ├── SymptomLog.js
│   │   │   ├── MoodLog.js
│   │   │   └── HealthLog.js
│   │   ├── routes/            # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── periodRoutes.js
│   │   │   ├── symptomRoutes.js
│   │   │   ├── moodRoutes.js
│   │   │   └── healthRoutes.js
│   │   ├── utils/             # Utility functions
│   │   │   └── logger.js      # Winston logger
│   │   ├── validators/        # Input validation
│   │   ├── seed.js           # Database seeding
│   │   └── server.js         # Express app entry point
│   ├── .env                   # Environment variables
│   ├── .eslintrc.cjs         # ESLint configuration
│   ├── .prettierrc           # Prettier configuration
│   └── package.json
│
├── frontend/                  # React application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── assets/          # Images, icons
│   │   ├── components/      # React components
│   │   │   ├── dashboard/
│   │   │   │   ├── CycleProgressBar.jsx
│   │   │   │   ├── PredictionCard.jsx
│   │   │   │   ├── QuickBmiCalculator.jsx
│   │   │   │   ├── RecentLogs.jsx
│   │   │   │   ├── StatusCard.jsx
│   │   │   │   └── LogButton.jsx
│   │   │   ├── trackers/
│   │   │   │   ├── Calendar.jsx
│   │   │   │   ├── PeriodTracker.jsx
│   │   │   │   ├── SymptomTracker.jsx
│   │   │   │   ├── MoodTracker.jsx
│   │   │   │   └── HealthTracker.jsx
│   │   │   ├── Alert.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── TestModeToggle.jsx
│   │   ├── contexts/        # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── DataContext.jsx
│   │   │   └── useAuth.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Signin.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Trackers.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Education.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── education/
│   │   │       ├── UnderstandingCycle.jsx
│   │   │       ├── PMSManagement.jsx
│   │   │       └── ProductGuide.jsx
│   │   ├── services/       # API integration
│   │   │   └── api.js
│   │   ├── styles/         # CSS modules
│   │   ├── utils/          # Helper functions
│   │   │   ├── cycleCalculations.js
│   │   │   └── testData.js
│   │   ├── App.jsx         # Root component
│   │   └── main.jsx        # React entry point
│   ├── .env                # Environment variables
│   ├── eslint.config.js   # ESLint configuration
│   ├── .prettierrc        # Prettier configuration
│   ├── vite.config.js     # Vite configuration
│   └── package.json
│
├── CODE_OF_CONDUCT.md      # Community guidelines
├── CODE_QUALITY.md         # Code standards documentation
├── CONTRIBUTING.md         # Contribution guidelines
├── LICENSE                 # MIT License
└── README.md              # This file
```

---

## 📚 Documentation

### Core Documentation

- **[Code Quality Guide](CODE_QUALITY.md)** - ESLint, Prettier, and coding standards
- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute to the project
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community standards and expectations

### API Documentation

#### Authentication Endpoints

```
POST   /api/auth/register          - Create new user account
POST   /api/auth/login             - Authenticate user
POST   /api/auth/logout            - Logout current user
POST   /api/auth/refresh-token     - Refresh JWT access token
GET    /api/auth/me                - Get current user profile
PUT    /api/auth/update-profile    - Update user profile
PUT    /api/auth/update-password   - Change password
```

#### Period Tracking Endpoints

```
GET    /api/periods                - Get all period logs
POST   /api/periods                - Create new period log
GET    /api/periods/:id            - Get specific period log
PUT    /api/periods/:id            - Update period log
DELETE /api/periods/:id            - Delete period log
```

#### Symptom Tracking Endpoints

```
GET    /api/symptoms               - Get all symptom logs
POST   /api/symptoms               - Log new symptoms
PUT    /api/symptoms/:id           - Update symptom log
DELETE /api/symptoms/:id           - Delete symptom log
```

#### Mood Tracking Endpoints

```
GET    /api/moods                  - Get all mood logs
POST   /api/moods                  - Log new mood entry
PUT    /api/moods/:id              - Update mood log
DELETE /api/moods/:id              - Delete mood log
```

#### Health Metrics Endpoints

```
GET    /api/health                 - Get all health logs
POST   /api/health                 - Log health metrics
PUT    /api/health/:id             - Update health log
DELETE /api/health/:id             - Delete health log
```

### Key Algorithms

**Cycle Prediction Algorithm**

- Uses historical period data (minimum 2 cycles)
- Calculates average cycle length and variance
- Predicts next period with ±2 day accuracy window
- Estimates ovulation (14 days before next period)
- Identifies fertile window (5 days before to 1 day after ovulation)

**Wellness Score Calculation**

- Starts at 100 (perfect health)
- Deducts points for health concerns:
  - Cycle Irregularity: -8 to -30 points
  - Abnormal Cycle Length: -5 to -15 points
  - Abnormal Period Length: -3 to -10 points
  - Symptom Burden: -5 to -25 points
  - Negative Moods: -5 to -20 points
- Score Categories:
  - 85-100: Excellent
  - 70-84: Good
  - 55-69: Fair
  - 40-54: Needs Attention
  - 0-39: Concerning

---

## 🧪 Development

### Available Scripts

**Backend (`cd backend`)**

```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run lint         # Check code quality with ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format code with Prettier
npm run seed         # Seed database with sample data
npm test             # Run test suite
```

**Frontend (`cd frontend`)**

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality with ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format code with Prettier
```

### Code Quality Standards

This project enforces strict code quality standards:

- **ESLint** for code quality and consistency
- **Prettier** for automatic formatting
- **Single quotes** for strings
- **Template literals** for string interpolation
- **4-space indentation**
- **100-character line width**

Run `npm run lint:fix` and `npm run format` before committing!

See [CODE_QUALITY.md](CODE_QUALITY.md) for detailed guidelines.

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (if configured)
cd frontend
npm test
```

### Database Seeding

Generate sample data for testing:

```bash
cd backend
npm run seed
```

This creates 5 test users with different health profiles and 12 months of tracking data.

---

## 🚢 Deployment

### Backend Deployment

**Environment Variables Required:**

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-production-mongodb-uri>
JWT_SECRET=<secure-secret-key>
JWT_REFRESH_SECRET=<secure-refresh-key>
CLIENT_URL=<your-frontend-url>
```

**Recommended Platforms:**

- Railway
- Render
- Heroku
- DigitalOcean App Platform
- AWS EC2/Elastic Beanstalk

### Frontend Deployment

**Environment Variables Required:**

```env
VITE_API_URL=<your-backend-api-url>
```

**Recommended Platforms:**

- Vercel (Recommended)
- Netlify
- Railway
- AWS Amplify
- GitHub Pages

### Database Hosting

**Recommended MongoDB Hosting:**

- MongoDB Atlas (Free tier available)
- Railway PostgreSQL (Alternative)

---

## 🤝 Contributing

We love contributions! 🎉

### How to Contribute

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Menstrual-Health-Tracker.git
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes** and commit:
   ```bash
   git commit -m 'Add: amazing new feature'
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Contribution Guidelines

- Read [CONTRIBUTING.md](CONTRIBUTING.md) before starting
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md)
- Write clear, descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Run linters before committing

### Areas for Contribution

- 🐛 **Bug Fixes**: Report or fix bugs
- ✨ **Features**: Implement new features
- 📝 **Documentation**: Improve docs
- 🎨 **UI/UX**: Enhance design
- 🧪 **Testing**: Add test coverage
- 🌐 **Internationalization**: Add translations
- ♿ **Accessibility**: Improve a11y

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Amanjeet

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgements

### Technologies & Libraries

- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Express.js](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Mongoose](https://mongoosejs.com/) - ODM
- [JWT](https://jwt.io/) - Authentication
- [Font Awesome](https://fontawesome.com/) - Icons

### Inspiration

- The menstrual health tracking community
- Healthcare professionals providing guidance
- Open source contributors worldwide

### Special Thanks

- All contributors who have helped shape this project
- Beta testers providing valuable feedback
- The React and Node.js communities

---

## 📞 Support & Contact

### Get Help

- 📫 **Email**: [amancrafts@example.com](mailto:amancrafts@example.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/AmanCrafts/Menstrual-Health-Tracker/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/AmanCrafts/Menstrual-Health-Tracker/discussions)

### Stay Connected

- ⭐ Star this repo if you find it helpful!
- 🔔 Watch for updates and new features
- 🍴 Fork to create your own version

---

## 🗺️ Roadmap

### Upcoming Features

- [ ] **Multi-language support** (i18n)
- [ ] **Data export** (PDF, CSV formats)
- [ ] **Medication reminders** and tracking
- [ ] **Partner sharing** features
- [ ] **Doctor appointment** integration
- [ ] **Dark mode** theme
- [ ] **Mobile apps** (iOS & Android)
- [ ] **AI-powered** health insights
- [ ] **Community forums** for support
- [ ] **Wearable device** integration

### Known Issues

- Mobile calendar swipe gestures need improvement
- Chart responsiveness on very small screens
- Test mode data persistence across sessions

See [Issues](https://github.com/AmanCrafts/Menstrual-Health-Tracker/issues) for detailed tracking.

---

<div align="center">

### 🌸 Made with ❤️ for better menstrual health

**If this project helped you, consider giving it a ⭐**

[Report Bug](https://github.com/AmanCrafts/Menstrual-Health-Tracker/issues) • [Request Feature](https://github.com/AmanCrafts/Menstrual-Health-Tracker/issues) • [Documentation](https://github.com/AmanCrafts/Menstrual-Health-Tracker/wiki)

</div>
