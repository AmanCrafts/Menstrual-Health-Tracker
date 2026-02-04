# 🎯 FlowSync Quick Reference

One-page reference for developers working on FlowSync.

---

## 📦 Project Structure

```
MHT/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React Context providers
│   │   ├── pages/        # Route pages
│   │   ├── services/     # API client
│   │   ├── styles/       # CSS modules
│   │   └── utils/        # Helper functions
│   └── package.json
└── backend/           # Node.js + Express API
    ├── src/
    │   ├── config/       # Configuration files
    │   ├── controllers/  # Route handlers
    │   ├── middleware/   # Express middleware
    │   ├── models/       # Mongoose models
    │   ├── routes/       # API routes
    │   └── utils/        # Helper functions
    └── package.json
```

---

## 🚀 Essential Commands

### Development

```bash
# Install dependencies
npm install              # Root (installs both)
cd frontend && npm install
cd backend && npm install

# Start development servers
npm run dev              # Root (starts both)
cd frontend && npm run dev    # Frontend only (port 5173)
cd backend && npm run dev     # Backend only (port 5000)

# Database
cd backend && npm run seed    # Seed database with test data
```

### Code Quality

```bash
# Format code
npm run format          # Format all code
npm run format:check    # Check formatting

# Lint code
npm run lint            # Lint all code
npm run lint:fix        # Auto-fix lint issues
```

### Testing

```bash
# Run tests
npm test                # Run all tests
npm run test:coverage   # With coverage report
npm run test:watch      # Watch mode
```

---

## 🔑 Environment Variables

### Backend (.env)

```bash
# Required
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/menstrual-health
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

---

## 🌐 API Endpoints

### Authentication

```bash
POST   /api/auth/register    # Register new user
POST   /api/auth/login        # Login user
POST   /api/auth/google       # Google OAuth
GET    /api/auth/me           # Get current user
PUT    /api/auth/profile      # Update profile
```

### Period Tracking

```bash
GET    /api/periods           # Get all periods
POST   /api/periods           # Create period log
GET    /api/periods/:id       # Get specific period
PUT    /api/periods/:id       # Update period
DELETE /api/periods/:id       # Delete period
GET    /api/periods/predict   # Get predictions
```

### Symptoms

```bash
GET    /api/symptoms          # Get all symptoms
POST   /api/symptoms          # Log symptom
PUT    /api/symptoms/:id      # Update symptom
DELETE /api/symptoms/:id      # Delete symptom
```

### Moods

```bash
GET    /api/moods             # Get all moods
POST   /api/moods             # Log mood
PUT    /api/moods/:id         # Update mood
DELETE /api/moods/:id         # Delete mood
```

### Health Metrics

```bash
GET    /api/health            # Get all health logs
POST   /api/health            # Create health log
GET    /api/health/analytics  # Get analytics
```

Authorization: Include `Authorization: Bearer <token>` header for protected routes.

---

## 🎨 Code Style

### JavaScript/JSX

```javascript
// Use template literals
const message = `Hello ${name}`;

// Use arrow functions
const handleClick = () => {
  console.log("clicked");
};

// Destructure props
const MyComponent = ({ title, onSubmit }) => {
  // Component code
};

// Use async/await
const fetchData = async () => {
  try {
    const response = await api.get("/endpoint");
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
```

### CSS

```css
/* Use CSS variables */
.button {
  background: var(--primary-color);
  color: var(--text-light);
  padding: var(--spacing-md);
}

/* Mobile-first responsive design */
.container {
  width: 100%;
}

@media (min-width: 768px) {
  .container {
    max-width: 1200px;
  }
}
```

---

## 🧪 Testing Patterns

### Frontend Component Test

```javascript
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MyComponent from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
```

### Backend API Test

```javascript
const request = require("supertest");
const app = require("../server");

describe("POST /api/auth/login", () => {
  it("returns token on valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });
});
```

---

## 🔐 Security Checklist

- JWT tokens for authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration
- Helmet.js security headers
- MongoDB injection prevention
- XSS protection
- HTTPS in production (required)
- Environment variables for secrets (required)

---

## 🐛 Debugging

### Frontend

```javascript
// React DevTools
// Install: https://react.dev/learn/react-developer-tools

// Console debugging
console.log("State:", { user, loading });

// VS Code debugger
// Add breakpoint → F5 to debug
```

### Backend

```javascript
// Debug logging
const logger = require('./utils/logger');
logger.info('User logged in', { userId });

// VS Code debugger
// Add to .vscode/launch.json:
{
    "type": "node",
    "request": "launch",
    "name": "Debug Backend",
    "program": "${workspaceFolder}/backend/src/server.js"
}
```

---

## 📊 Database Schema

### User

```javascript
{
    name: String,
    email: String (unique),
    password: String (hashed),
    dateOfBirth: Date,
    avgCycleLength: Number (default: 28),
    avgPeriodLength: Number (default: 5),
    isTestMode: Boolean (default: false),
    createdAt: Date,
    updatedAt: Date
}
```

### Period Log

```javascript
{
    userId: ObjectId (ref: User),
    startDate: Date,
    endDate: Date,
    flow: String (light/medium/heavy),
    notes: String,
    createdAt: Date,
    updatedAt: Date
}
```

### Symptom Log

```javascript
{
    userId: ObjectId (ref: User),
    date: Date,
    symptoms: [String],
    severity: String (mild/moderate/severe),
    notes: String,
    createdAt: Date,
    updatedAt: Date
}
```

### Mood Log

```javascript
{
    userId: ObjectId (ref: User),
    date: Date,
    mood: String,
    energy: Number (1-10),
    notes: String,
    createdAt: Date,
    updatedAt: Date
}
```

### Health Log

```javascript
{
    userId: ObjectId (ref: User),
    date: Date,
    weight: Number,
    height: Number,
    bmi: Number,
    temperature: Number,
    notes: String,
    createdAt: Date,
    updatedAt: Date
}
```

---

## 🎯 Git Workflow

### Branch Naming

```bash
feature/add-period-export      # New feature
fix/calendar-date-bug          # Bug fix
docs/update-readme             # Documentation
refactor/auth-controller       # Code refactor
test/add-auth-tests            # Tests
```

### Commit Messages

```bash
# Format: <type>(<scope>): <subject>

feat(periods): add export to CSV functionality
fix(auth): resolve token expiration issue
docs(readme): update installation instructions
refactor(api): simplify error handling
test(auth): add unit tests for login
```

### Workflow

```bash
# 1. Create branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat(component): add new feature"

# 3. Push and create PR
git push origin feature/my-feature
# Open PR on GitHub

# 4. After review and merge
git checkout main
git pull origin main
git branch -d feature/my-feature
```

---

## 🎨 Design Tokens

```css
/* Colors */
--primary-color: #6c63ff;
--accent-color: #ec4899;
--success-color: #10b981;
--warning-color: #f59e0b;
--error-color: #ef4444;

/* Typography */
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;

/* Spacing */
--spacing-sm: 0.5rem;
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
--spacing-xl: 2rem;

/* Borders */
--border-radius-sm: 4px;
--border-radius-md: 8px;
--border-radius-lg: 12px;

/* Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
```

---

## 📞 Getting Help

| Issue Type    | Resource                                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| 🐛 Bug        | [Open Issue](https://github.com/AmanCrafts/Menstrual-Health-Tracker/issues/new?template=bug_report.md)           |
| 💡 Feature    | [Feature Request](https://github.com/AmanCrafts/Menstrual-Health-Tracker/issues/new?template=feature_request.md) |
| 🔒 Security   | [SECURITY.md](SECURITY.md)                                                                                       |
| 📖 Docs       | [DOCUMENTATION.md](DOCUMENTATION.md)                                                                             |
| 💬 Discussion | [GitHub Discussions](https://github.com/AmanCrafts/Menstrual-Health-Tracker/discussions)                         |

---

## 📚 Documentation

| Document                                     | Purpose                 |
| -------------------------------------------- | ----------------------- |
| [README.md](README.md)                       | Project overview        |
| [SETUP_GUIDE.md](SETUP_GUIDE.md)             | Installation guide      |
| [CONTRIBUTING.md](CONTRIBUTING.md)           | Contribution guidelines |
| [CODE_QUALITY.md](CODE_QUALITY.md)           | Code standards          |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | API reference           |
| [TESTING_GUIDE.md](TESTING_GUIDE.md)         | Testing guide           |
| [DESIGN_GUIDE.md](DESIGN_GUIDE.md)           | Design system           |
| [SECURITY.md](SECURITY.md)                   | Security policy         |
| [CHANGELOG.md](CHANGELOG.md)                 | Version history         |

---

## 🚀 Deployment

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Production
vercel --prod
```

### Railway/Render (Backend)

```bash
# Add to railway.json or render.yaml
{
    "build": {
        "builder": "NIXPACKS"
    },
    "deploy": {
        "startCommand": "npm start",
        "healthcheckPath": "/api/health"
    }
}
```

---

<div align="center">

**Keep this reference handy while developing!** 🎉

[Full Documentation](DOCUMENTATION.md) | [Report Issue](https://github.com/AmanCrafts/Menstrual-Health-Tracker/issues)

</div>
