# Contributing to MSTREAM

Thank you for your interest in contributing to **MSTREAM**! This document provides guidelines and instructions for contributing to this project.

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **pnpm**: `v9.x` or higher (MSTREAM strictly uses **pnpm**)

### Getting Started

1. **Fork and clone** the repository:
   ```bash
   git clone https://github.com/your-username/mstream.git
   cd mstream
   ```

2. **Install dependencies** using `pnpm`:
   ```bash
   pnpm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   Add your TMDB API Read Access Token to `.env`.

4. **Start the dev server**:
   ```bash
   pnpm run dev
   ```

---

## 📋 Git Workflow & Branching

- Create a descriptive branch from `main`:
  - `feat/feature-name` for new features
  - `fix/bug-name` for bug fixes
  - `docs/doc-update` for documentation changes
  - `refactor/component-name` for code refactoring

```bash
git checkout -b feat/add-new-server-provider
```

---

## 💬 Conventional Commits

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for all commit messages.

### Commit Format

```text
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Common Types

- `feat`: A new feature (e.g., `feat(library): add export to json`)
- `fix`: A bug fix (e.g., `fix(home): adjust trending spacing on mobile`)
- `docs`: Documentation only changes (e.g., `docs: update architecture guide`)
- `style`: Changes that do not affect code meaning (formatting, semicolons)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `chore`: Build process, dependency updates, or tooling changes

---

## 🧹 Code Quality & Formatting

Before committing, ensure your code passes linting and formatting checks:

```bash
# Check for ESLint errors
pnpm run lint

# Check code formatting
pnpm run format:check

# Automatically fix formatting issues
pnpm run format:fix

# Verify production build passes cleanly
pnpm run build
```

---

## 🚀 Pull Request Checklist

When submitting a Pull Request, please ensure:

- [ ] Used **pnpm** for package installation.
- [ ] Code follows project standards and clean architecture.
- [ ] `pnpm run lint` passes with 0 errors.
- [ ] `pnpm run build` generates `/dist` without build errors.
- [ ] Responsive design verified on mobile viewports (`<= 640px` and `<= 480px`).
- [ ] Commit messages follow the Conventional Commits format.
- [ ] PR description clearly explains what changed and why.
