# GitHub Repository Setup Guide

This guide provides step-by-step instructions for initializing the Git repository, committing the code, and pushing to GitHub.

## Prerequisites

- Git installed on your system
- GitHub account created
- GitHub repository created (can be empty)

## Step 1: Initialize Git Repository

Open your terminal in the project root directory and run:

```bash
git init
```

This creates a new Git repository in your project.

## Step 2: Review .gitignore

The `.gitignore` file has been configured to exclude:

- `node_modules/` - Dependencies (will be installed via npm)
- `dist/` and `dist-ssr/` - Build outputs
- `.env`, `.env.local`, `.env.production` - Environment variables with secrets
- Log files and editor-specific files
- Optional: Development documentation files (TASK_*.md, CHECKPOINT_*.md)

**Important:** If you want to exclude the development documentation files (TASK_*.md, CHECKPOINT_*.md, VERCEL_CONFIG.md), uncomment the lines at the bottom of `.gitignore`:

```gitignore
# Development documentation (optional - uncomment to exclude)
TASK_*.md
CHECKPOINT_*.md
VERCEL_CONFIG.md
```

## Step 3: Stage All Files

Add all files to the staging area:

```bash
git add .
```

## Step 4: Verify Staged Files

Check what files will be committed:

```bash
git status
```

**Expected files to be committed:**
- Source code (`src/` directory)
- Configuration files (`package.json`, `tsconfig.json`, `vite.config.ts`, etc.)
- Documentation (`README.md`, `DEPLOYMENT.md`, `LICENSE`)
- Supabase migrations (`supabase/` directory)
- Public assets (`public/` directory)
- `.gitignore` and `.env.example`

**Files that should NOT be committed:**
- `node_modules/`
- `dist/`
- `.env` (only `.env.example` should be committed)
- Log files

If you see any of these excluded files in `git status`, check your `.gitignore` file.

## Step 5: Create Initial Commit

Commit all staged files:

```bash
git commit -m "Initial commit: ShiKaraKa Anime Portal

- Complete React + TypeScript + Vite setup
- Supabase integration for auth and database
- Shikimori API integration for anime data
- React Query for state management and caching
- Tailwind CSS with Modern Dark Cinema design
- Responsive design for mobile, tablet, and desktop
- Video player with adaptive iframe
- Authentication (login/register)
- Favorites functionality
- Search with debounce
- Error handling and loading states
- Code splitting and performance optimizations
- Unit tests and property-based tests
- Deployment configuration for Vercel"
```

## Step 6: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the details:
   - **Repository name**: `shikaraka-anime-portal` (or your preferred name)
   - **Description**: "Modern anime portal built with React, Supabase, and Shikimori API"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

## Step 7: Add Remote Repository

Copy the repository URL from GitHub (it will look like `https://github.com/yourusername/shikaraka-anime-portal.git`) and run:

```bash
git remote add origin https://github.com/yourusername/shikaraka-anime-portal.git
```

Replace `yourusername` with your actual GitHub username.

## Step 8: Verify Remote

Check that the remote was added correctly:

```bash
git remote -v
```

You should see:
```
origin  https://github.com/yourusername/shikaraka-anime-portal.git (fetch)
origin  https://github.com/yourusername/shikaraka-anime-portal.git (push)
```

## Step 9: Push to GitHub

Push your code to GitHub:

```bash
git branch -M main
git push -u origin main
```

**Explanation:**
- `git branch -M main` - Renames the default branch to "main"
- `git push -u origin main` - Pushes the code and sets up tracking

## Step 10: Verify on GitHub

1. Go to your repository on GitHub
2. Refresh the page
3. You should see all your files and the initial commit

## Troubleshooting

### Authentication Issues

If you encounter authentication errors, you may need to:

1. **Use Personal Access Token (recommended)**:
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` scope
   - Use the token as your password when pushing

2. **Use SSH instead of HTTPS**:
   ```bash
   git remote set-url origin git@github.com:yourusername/shikaraka-anime-portal.git
   ```
   Make sure you have SSH keys set up on GitHub.

### Large Files Warning

If you see warnings about large files:
- Make sure `node_modules/` is in `.gitignore`
- Run `git rm -r --cached node_modules` if it was accidentally staged
- Commit the change and push again

### Merge Conflicts

If you initialized the GitHub repository with a README or license:
```bash
git pull origin main --allow-unrelated-histories
# Resolve any conflicts
git push origin main
```

## Next Steps

After successfully pushing to GitHub:

1. **Set up Vercel deployment** (see Task 20.2)
2. **Configure environment variables** in Vercel dashboard
3. **Test the production deployment**

## Additional Git Commands

### View Commit History
```bash
git log --oneline
```

### Check Current Branch
```bash
git branch
```

### Create a New Branch
```bash
git checkout -b feature/new-feature
```

### Push a New Branch
```bash
git push -u origin feature/new-feature
```

## Repository Maintenance

### Regular Commits

As you make changes, follow this workflow:

```bash
# Check what changed
git status

# Stage specific files
git add src/components/NewComponent.tsx

# Or stage all changes
git add .

# Commit with descriptive message
git commit -m "Add NewComponent for feature X"

# Push to GitHub
git push
```

### Commit Message Best Practices

- Use present tense ("Add feature" not "Added feature")
- Be descriptive but concise
- Reference issues if applicable ("Fix #123: Resolve login bug")

## Security Reminders

✅ **DO commit:**
- `.env.example` (template without secrets)
- Source code
- Configuration files
- Documentation

❌ **DO NOT commit:**
- `.env` (contains actual secrets)
- `node_modules/`
- Build outputs (`dist/`)
- API keys or passwords

---

**Congratulations!** Your ShiKaraKa Anime Portal is now on GitHub and ready for deployment! 🎉
