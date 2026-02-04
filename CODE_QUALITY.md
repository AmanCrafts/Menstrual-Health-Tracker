# Code Quality Setup

This project uses **Prettier** for code formatting and **ESLint** for linting to maintain consistent, clean code.

## Frontend Setup

### Configuration Files
- `.prettierrc` - Prettier configuration (single quotes, 4-space tabs, 100 char line width)
- `.prettierignore` - Files/folders excluded from formatting
- `eslint.config.js` - ESLint configuration with React-specific rules

### NPM Scripts
```bash
# Format all code
npm run format

# Check formatting without modifying files
npm run format:check

# Run ESLint to check for issues
npm run lint

# Auto-fix ESLint issues
npm run lint:fix
```

### Key Rules
- **Single quotes** for strings
- **Template literals** preferred over string concatenation
- **4 spaces** for indentation
- **100 characters** max line width
- **Semicolons** required
- **Trailing commas** in ES5-compatible places

## Backend Setup

### Configuration Files
- `.prettierrc` - Prettier configuration (same as frontend)
- `.prettierignore` - Files/folders excluded from formatting
- `.eslintrc.cjs` - ESLint configuration for Node.js

### NPM Scripts
```bash
# Format all code
npm run format

# Check formatting without modifying files
npm run format:check

# Run ESLint to check for issues
npm run lint

# Auto-fix ESLint issues
npm run lint:fix
```

### Key Rules
- **Single quotes** for strings
- **Template literals** preferred over string concatenation
- **4 spaces** for indentation
- **100 characters** max line width
- **Semicolons** required
- Unused parameters must be prefixed with `_`

## Pre-commit Workflow (Recommended)

Before committing code, run:
```bash
# Frontend
cd frontend
npm run format
npm run lint:fix

# Backend
cd backend
npm run format
npm run lint:fix
```

## IDE Integration

### VS Code
Install these extensions for automatic formatting:
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)

Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## String Conventions

All strings should use **template literals** when:
- Concatenating strings
- Including variables in strings
- Multi-line strings

Example:
```javascript
// ❌ Avoid
const message = 'Hello, ' + name + '!';
const path = baseUrl + '/api/' + endpoint;

// ✅ Preferred
const message = `Hello, ${name}!`;
const path = `${baseUrl}/api/${endpoint}`;
```

For simple static strings, single quotes are fine:
```javascript
const greeting = 'Hello';
```
