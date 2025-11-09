# OneSig Development Workflow

Development best practices and workflows for OneSig project.

---

## 📋 Overview

This document outlines development workflows, coding standards, and best practices for working on OneSig.

---

## 🌿 Git Workflow

### Branch Strategy

**Main Branches:**
- `main` - Production-ready code (auto-deploys to Vercel)
- `develop` - Integration branch for features (Phase 2+)

**Feature Branches:**
- `feature/[feature-name]` - New features
- `fix/[bug-name]` - Bug fixes
- `docs/[doc-name]` - Documentation updates

**Current Branch (Phase 1):**
- `claude/onesig-mvp-prd-implementation-011CUxJ4zYxs9oipqZua7LXt`

### Commit Messages

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no logic change)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```bash
git commit -m "feat(scraper): add filter for trades >$100k"
git commit -m "fix(landing-page): email validation not working on mobile"
git commit -m "docs(readme): update setup instructions"
git commit -m "chore(deps): update Next.js to 14.2.0"
```

### Common Git Commands

```bash
# Check current status
git status

# Create new feature branch
git checkout -b feature/new-feature-name

# Add files
git add .
git add specific-file.ts

# Commit changes
git commit -m "feat(scope): description"

# Push to remote
git push origin feature/new-feature-name

# Pull latest changes
git pull origin main

# Merge main into your branch
git checkout feature/your-feature
git merge main

# View commit history
git log --oneline
git log --graph --oneline --all

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- filename
```

---

## 💻 Development Environment

### Required Extensions (VS Code)

**Python:**
- Python (Microsoft)
- Pylance
- Python Indent

**JavaScript/TypeScript:**
- ESLint
- Prettier
- Tailwind CSS IntelliSense

**General:**
- GitLens
- Markdown All in One
- EditorConfig

### Environment Variables

**Landing Page (.env.local):**
```env
NODE_ENV=development
NEXT_PUBLIC_SITE_NAME=OneSig
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Phase 2+ (Database):**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

**Never commit `.env.local` to git!**

---

## 🐍 Python Development

### Code Style

Follow **PEP 8** style guide:
- 4 spaces for indentation
- Max line length: 88 characters (Black formatter)
- Snake case for functions and variables: `get_insider_trades()`
- Pascal case for classes: `SECInsiderTradeScraper`

### Type Hints

Use type hints for function signatures:

```python
from typing import List, Dict, Optional

def get_filing_details(filing_url: str) -> Optional[Dict]:
    """Fetch and parse Form 4 filing details."""
    pass

def process_all_filings(days: int = 7) -> List[Dict]:
    """Process all recent filings."""
    pass
```

### Docstrings

Use Google-style docstrings:

```python
def get_recent_form4_filings(days: int = 7) -> List[Dict]:
    """
    Fetch recent Form 4 filings from SEC EDGAR.

    Args:
        days: Number of days to look back for filings

    Returns:
        List of filing metadata dictionaries

    Raises:
        RequestException: If SEC API request fails
    """
    pass
```

### Error Handling

Always handle exceptions gracefully:

```python
import logging

logger = logging.getLogger(__name__)

try:
    response = self._rate_limited_get(url)
    response.raise_for_status()
except requests.exceptions.RequestException as e:
    logger.error(f"Error fetching {url}: {e}")
    raise
```

### Testing

**Run Tests:**
```bash
cd data-collection
source venv/bin/activate
pytest tests/
```

**Write Tests:**
```python
# tests/test_scraper.py
import pytest
from sec_scraper import SECInsiderTradeScraper

def test_scraper_initialization():
    scraper = SECInsiderTradeScraper()
    assert scraper.headers["User-Agent"] == "OneSig contact@onesig.co"

def test_parse_transaction():
    # Test parsing logic
    pass
```

---

## ⚛️ Next.js Development

### Code Style

Follow Next.js and React best practices:
- **2 spaces** for indentation
- **Pascal case** for components: `EmailSignupForm.tsx`
- **Camel case** for functions: `handleSubmit()`
- Use **TypeScript** for all new code

### Component Structure

```tsx
'use client' // Only if using client-side features

import { useState } from 'react'

interface ComponentProps {
  title: string
  description?: string
}

export default function Component({ title, description }: ComponentProps) {
  const [state, setState] = useState('')

  const handleAction = () => {
    // Logic here
  }

  return (
    <div className="container">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  )
}
```

### File Organization

```
landing-page/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── api/                 # API routes (Phase 2+)
│       └── subscribe/
│           └── route.ts
│
├── components/              # Reusable components
│   ├── EmailSignupForm.tsx
│   ├── FeatureCard.tsx
│   └── FAQItem.tsx
│
├── lib/                     # Utility functions (Phase 2+)
│   ├── supabase.ts
│   └── utils.ts
│
└── public/                  # Static assets
    ├── favicon.ico
    └── images/
```

### TypeScript

Use strict types:

```tsx
// Good
interface User {
  email: string
  name?: string
  subscribed: boolean
}

const user: User = {
  email: 'user@example.com',
  subscribed: true
}

// Bad
const user: any = { ... }
```

### Tailwind CSS

Use utility classes consistently:

```tsx
// Good - Organized by category
<div className="
  flex flex-col items-center
  max-w-4xl mx-auto px-4
  space-y-8
  animate-fade-in
">

// Bad - Random order
<div className="mx-auto space-y-8 flex animate-fade-in px-4 max-w-4xl items-center flex-col">
```

### Testing

**Type Checking:**
```bash
cd landing-page
npm run type-check
```

**Linting:**
```bash
npm run lint
npm run lint -- --fix  # Auto-fix issues
```

**Build Test:**
```bash
npm run build
```

---

## 📝 Newsletter Development

### Template Maintenance

**Location:** `newsletter/templates/weekly-template.md`

**Updating Template:**
1. Edit `weekly-template.md`
2. Test with sample data
3. Document changes in template instructions
4. Notify team (if applicable)

### Sample Newsletters

**Creating Samples:**
```bash
# Create new sample
cp newsletter/templates/weekly-template.md \
   newsletter/samples/sample-newsletter-$(date +%Y-%m-%d).md

# Edit with realistic data
nano newsletter/samples/sample-newsletter-*.md
```

**Use Cases:**
- Onboarding new team members
- Testing Beehiiv formatting
- Showing potential subscribers
- A/B testing different formats

---

## 🚀 Deployment Workflow

### Automatic Deployment (Vercel)

**Trigger:** Push to `main` branch

```bash
# Make changes
git add .
git commit -m "feat(landing): improve mobile layout"

# Push to main (triggers deployment)
git push origin main
```

**Vercel automatically:**
1. Detects push to `main`
2. Runs `npm run build`
3. Deploys to production
4. Provides deployment URL

**Deployment Status:**
- Check Vercel dashboard
- Receive email notification
- Preview at deployment URL

### Preview Deployments

**Trigger:** Push to any branch (non-main)

```bash
# Push feature branch
git push origin feature/new-feature
```

**Vercel creates:**
- Preview deployment URL
- No impact on production
- Test before merging to main

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from landing-page directory
cd landing-page
vercel

# Deploy to production
vercel --prod
```

---

## 🧪 Testing Workflow

### Before Committing

**Python:**
```bash
cd data-collection
source venv/bin/activate

# Run tests
pytest tests/

# Run linter
flake8 sec_scraper.py

# Run type checker
mypy sec_scraper.py

deactivate
```

**Next.js:**
```bash
cd landing-page

# Type check
npm run type-check

# Lint
npm run lint

# Build test
npm run build
```

### Before Deploying

**Full Test Checklist:**
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Build succeeds
- [ ] Manual testing on dev server
- [ ] Test on mobile device
- [ ] All links work
- [ ] Forms submit correctly

---

## 📊 Code Review Checklist

### Python Code Review

**Functionality:**
- [ ] Code works as intended
- [ ] Handles errors gracefully
- [ ] No hardcoded secrets or API keys

**Code Quality:**
- [ ] Follows PEP 8 style
- [ ] Has type hints
- [ ] Has docstrings
- [ ] No commented-out code

**Performance:**
- [ ] No unnecessary API calls
- [ ] Efficient data processing
- [ ] Respects rate limits

### Next.js Code Review

**Functionality:**
- [ ] Component renders correctly
- [ ] Props validated with TypeScript
- [ ] Handles edge cases

**Code Quality:**
- [ ] Follows React best practices
- [ ] No console.log in production code
- [ ] Accessibility considerations (ARIA labels, semantic HTML)

**Performance:**
- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] Uses Next.js features (Image, Link)

---

## 📚 Documentation Workflow

### When to Update Docs

**Always update docs when:**
- Adding new features
- Changing APIs or interfaces
- Modifying workflows
- Fixing bugs that affect usage
- Adding dependencies

### Documentation Locations

| Type | Location |
|------|----------|
| Project overview | `/README.md` |
| Setup instructions | `/docs/setup-guide.md` |
| Development workflow | `/docs/development-workflow.md` |
| Data collection | `/data-collection/README.md` |
| Newsletter workflow | `/newsletter/README.md` |
| Legal | `/legal/README.md` |
| API docs | `/landing-page/app/api/README.md` (Phase 2+) |

### Documentation Style

**Formatting:**
- Use clear headings (H1-H4)
- Code blocks with syntax highlighting
- Tables for structured data
- Bullet points for lists
- Emojis for visual navigation (sparingly)

**Writing Style:**
- Active voice
- Present tense
- Second person ("You can...")
- Clear, concise language
- Step-by-step instructions

---

## 🔄 Release Workflow (Phase 2+)

### Semantic Versioning

Format: `MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes (e.g., 1.0.0 → 2.0.0)
- **MINOR:** New features (e.g., 1.0.0 → 1.1.0)
- **PATCH:** Bug fixes (e.g., 1.0.0 → 1.0.1)

### Release Process

1. **Update Version:**
   ```bash
   # In landing-page/package.json
   "version": "1.1.0"
   ```

2. **Update Changelog:**
   ```markdown
   # Changelog

   ## [1.1.0] - 2025-11-09
   ### Added
   - New feature X
   - New component Y

   ### Fixed
   - Bug Z
   ```

3. **Create Git Tag:**
   ```bash
   git tag -a v1.1.0 -m "Release v1.1.0"
   git push origin v1.1.0
   ```

4. **Deploy to Production:**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

5. **Announce Release:**
   - Email subscribers (if breaking changes)
   - Update website
   - Post on social media

---

## 🐛 Debugging Tips

### Python Debugging

**Use logging instead of print:**
```python
import logging

logger = logging.getLogger(__name__)
logger.info(f"Processing {len(filings)} filings")
logger.error(f"Error: {e}")
```

**Interactive debugging:**
```python
# Add breakpoint
import pdb; pdb.set_trace()

# Then use:
# n - next line
# s - step into function
# c - continue
# p variable - print variable
```

### Next.js Debugging

**Console logging:**
```tsx
// Development only
if (process.env.NODE_ENV === 'development') {
  console.log('Debug:', variable)
}
```

**React DevTools:**
- Install browser extension
- Inspect component props and state
- Track re-renders

**Next.js Debugging:**
```json
// package.json
"scripts": {
  "dev:debug": "NODE_OPTIONS='--inspect' next dev"
}
```

---

## 🛠️ Troubleshooting

### Common Issues

**Issue: "Module not found"**
```bash
# Python
pip install -r requirements.txt

# Node.js
npm install
```

**Issue: "Port already in use"**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill

# Or use different port
npm run dev -- -p 3001
```

**Issue: "Build fails on Vercel"**
- Check build logs in Vercel dashboard
- Ensure environment variables are set
- Test build locally: `npm run build`

---

## 📞 Getting Help

### Internal Resources

- **Setup Issues:** Check `/docs/setup-guide.md`
- **Workflow Questions:** This document
- **API Questions:** Check service documentation

### External Resources

- **Next.js:** https://nextjs.org/docs
- **Python:** https://docs.python.org/3/
- **Vercel:** https://vercel.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs/

### Contact

- **Technical Questions:** Create GitHub issue
- **Urgent Issues:** contact@onesig.co

---

## ✅ Pre-Commit Checklist

Before committing code:

- [ ] Code runs without errors
- [ ] Tests pass (if applicable)
- [ ] No console.log or debug statements
- [ ] No commented-out code
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] Commit message follows format
- [ ] No sensitive data (API keys, passwords)

---

## 🎯 Development Priorities

### Phase 1 (Current)
- ✅ Core functionality working
- ✅ Manual processes optimized
- 🔄 User feedback collected
- 🔄 Bug fixes

### Phase 2 (Next)
- Automation of data collection
- Database integration
- API development
- Enhanced analytics

### Phase 3+
- Full dashboard
- Real-time features
- Advanced analytics
- Scale optimization

---

**Last Updated: November 9, 2025**
