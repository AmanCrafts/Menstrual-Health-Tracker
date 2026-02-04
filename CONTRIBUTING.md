# 🤝 Contributing to FlowSync

Thank you for your interest in contributing to **FlowSync**! 🎉

We welcome contributions of all kinds — bug fixes, new features, documentation improvements, design enhancements, and more. This guide will help you get started.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Areas for Contribution](#areas-for-contribution)

---

## 📜 Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

---

## 🎯 Getting Started

### Prerequisites

Before you begin, ensure you have:

- Node.js 18.0+ installed
- MongoDB 5.0+ installed and running
- Git for version control
- A GitHub account
- Basic knowledge of React and Express.js

### Fork and Clone

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Menstrual-Health-Tracker.git
   cd Menstrual-Health-Tracker
   ```
3. **Add upstream** remote:
   ```bash
   git remote add upstream https://github.com/AmanCrafts/Menstrual-Health-Tracker.git
   ```

---

## 🔧 Development Setup

### 1. Install Dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env` files as described in the main [README.md](README.md#installation).

### 3. Start Development Servers

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

### 4. Verify Setup

- Backend API: http://localhost:5000
- Frontend App: http://localhost:5173
- Test the signup/login flow

---

## 🛠 Making Changes

### Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch Naming Convention:

- `feature/` - New features (e.g., `feature/add-medication-tracking`)
- `fix/` - Bug fixes (e.g., `fix/calendar-date-picker`)
- `docs/` - Documentation (e.g., `docs/update-api-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-service`)
- `style/` - UI/styling changes (e.g., `style/improve-dashboard`)
- `test/` - Test additions (e.g., `test/add-auth-tests`)

### Make Your Changes

1. **Write clean, readable code** following our [code style](#code-style)
2. **Comment complex logic** for future maintainers
3. **Add tests** for new functionality
4. **Update documentation** if needed

### Keep Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

---

## 💬 Commit Guidelines

We follow **Conventional Commits** for clear, semantic commit messages.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style/formatting (no logic change)
- `refactor:` - Code restructuring
- `test:` - Adding/updating tests
- `chore:` - Build/tooling changes

### Examples

```bash
feat(analytics): add cycle prediction accuracy metric

fix(auth): resolve token refresh infinite loop

docs(readme): update installation instructions

style(dashboard): improve mobile responsiveness

refactor(api): extract validation middleware

test(periods): add unit tests for date calculations

chore(eslint): update linting rules
```

### Commit Best Practices

✅ **Do:**

- Write clear, descriptive messages
- Use present tense ("add feature" not "added feature")
- Keep commits focused (one logical change per commit)
- Reference issue numbers (`fixes #123`)

❌ **Don't:**

- Use vague messages ("fix bug", "update code")
- Combine multiple unrelated changes
- Commit commented-out code
- Include WIP commits in PRs

---

## 🔄 Pull Request Process

### Before Submitting

Run these checks:

```bash
# Format code
npm run format

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Build successfully
npm run build
```

### Submit Your PR

1. **Push your branch:**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request** on GitHub

3. **Fill out the PR template** with:
   - Clear description of changes
   - Related issue numbers
   - Screenshots (for UI changes)
   - Testing steps

4. **Wait for review** - maintainers will review your PR

### PR Title Format

```
feat: add medication reminder feature
fix: resolve calendar date picker bug
docs: improve API documentation
```

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-reviewed code changes
- [ ] Commented complex/hard-to-understand code
- [ ] Updated documentation as needed
- [ ] No new warnings or errors
- [ ] Added tests for new functionality
- [ ] All tests pass locally
- [ ] Formatted with Prettier
- [ ] Linted with ESLint (no errors)

---

## 🎨 Code Style

### General Principles

- **DRY** - Don't Repeat Yourself
- **KISS** - Keep It Simple, Stupid
- **YAGNI** - You Aren't Gonna Need It
- **Single Responsibility** - One function, one purpose

### JavaScript/React Style

```javascript
// ✅ Good - template literals for interpolation
const message = `Hello, ${userName}!`;

// ❌ Bad - string concatenation
const message = "Hello, " + userName + "!";

// ✅ Good - destructuring
const { name, email } = user;

// ❌ Bad - multiple property access
const name = user.name;
const email = user.email;

// ✅ Good - early returns
function validateUser(user) {
  if (!user) return false;
  if (!user.email) return false;
  return true;
}

// ✅ Good - async/await
async function fetchData() {
  try {
    const response = await api.get("/data");
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
```

### Component Structure

```javascript
// Imports
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ComponentName from "./ComponentName";

// Component
export default function MyComponent() {
  // Hooks
  const navigate = useNavigate();
  const [state, setState] = useState(null);

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Event handlers
  const handleClick = () => {
    // Handler logic
  };

  // Render helpers
  const renderContent = () => {
    // Render logic
  };

  // JSX
  return <div className="my-component">{/* Content */}</div>;
}
```

### CSS Guidelines

```css
/* ✅ Good - BEM naming */
.card {
}
.card__header {
}
.card__header--highlighted {
}

/* ✅ Good - CSS variables */
:root {
  --primary-color: #6c63ff;
  --spacing-md: 1rem;
}

/* ✅ Good - mobile-first responsive */
.container {
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}
```

### Linting & Formatting

We use **ESLint** and **Prettier** for consistency:

```bash
# Auto-format code
npm run format

# Fix linting issues
npm run lint:fix
```

See [CODE_QUALITY.md](CODE_QUALITY.md) for detailed standards.

---

## 🎯 Areas for Contribution

### 🐛 Bug Fixes

- Browse [open issues](https://github.com/AmanCrafts/Menstrual-Health-Tracker/issues?q=is%3Aissue+is%3Aopen+label%3Abug)
- Check reported bugs in production
- Fix edge cases in existing features

### ✨ New Features

- Medication tracking and reminders
- Data export (PDF, CSV)
- Multi-language support (i18n)
- Dark mode theme
- Wearable device integration
- Social features (partner sharing)

### 📝 Documentation

- Improve README clarity
- Add code comments
- Create tutorial videos
- Write API documentation
- Add JSDoc comments

### 🎨 Design & UX

- Improve mobile responsiveness
- Enhance accessibility (a11y)
- Create loading states
- Add animations
- Improve error messages
- Design new icons

### 🧪 Testing

- Add unit tests
- Write integration tests
- Add E2E tests
- Improve test coverage

### 🌐 Internationalization

- Add language translations
- Localize date/time formats
- Support RTL languages

### ♿ Accessibility

- Add ARIA labels
- Improve keyboard navigation
- Enhance screen reader support
- Increase color contrast

---

## 💡 Tips for Contributors

### First Time Contributors

- Look for [`good first issue`](https://github.com/AmanCrafts/Menstrual-Health-Tracker/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) label
- Start with documentation improvements
- Ask questions if anything is unclear
- Join discussions on existing issues

### Communication

- Be respectful and professional
- Provide context in issues/PRs
- Be patient with reviews
- Ask for help when stuck

### Getting Faster Reviews

- Keep PRs small and focused
- Write clear descriptions
- Add screenshots for UI changes
- Respond to feedback promptly
- Keep PR up to date with main branch

---

## 🆘 Need Help?

### Resources

- 📖 [Main README](README.md)
- 📋 [Code Quality Guide](CODE_QUALITY.md)
- 🐛 [Report Issues](https://github.com/AmanCrafts/Menstrual-Health-Tracker/issues)
- 💬 [Discussions](https://github.com/AmanCrafts/Menstrual-Health-Tracker/discussions)

### Contact

- **Email**: amancrafts@example.com
- **GitHub**: [@AmanCrafts](https://github.com/AmanCrafts)

---

<div align="center">

### Thank you for contributing! 🙏

**Every contribution, no matter how small, makes a difference.**

[Report Bug](https://github.com/AmanCrafts/Menstrual-Health-Tracker/issues) • [Request Feature](https://github.com/AmanCrafts/Menstrual-Health-Tracker/issues) • [Ask Question](https://github.com/AmanCrafts/Menstrual-Health-Tracker/discussions)

</div>
- Request features 💡
- Ask questions 💬

---

## 🦮 Thank You

Every contribution — big or small — moves FlowSync forward.  
Your time and effort are appreciated. Let’s make this project amazing together!
