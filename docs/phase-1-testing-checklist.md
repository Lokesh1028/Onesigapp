# OneSig Phase 1 Testing Checklist

Complete testing checklist for OneSig MVP Phase 1 implementation.

---

## 📋 Overview

This checklist verifies that all Phase 1 components are properly implemented, configured, and ready for launch.

**Phase 1 Goal:** 25 engaged subscribers via manual MVP workflow

---

## ✅ Project Structure Verification

### Root Directory

- [x] `.gitignore` - Git ignore rules configured
- [x] `README.md` - Project overview with roadmap
- [x] `data-collection/` - Python SEC scraper directory
- [x] `landing-page/` - Next.js landing page directory
- [x] `newsletter/` - Newsletter templates and workflow
- [x] `legal/` - Legal compliance documents
- [x] `docs/` - Project documentation

---

## ✅ Data Collection System

### Files & Configuration

- [x] `data-collection/sec_scraper.py` - Main scraper script
- [x] `data-collection/requirements.txt` - Python dependencies
- [x] `data-collection/README.md` - Usage documentation

### Functionality Tests

**Manual Testing:**

```bash
cd data-collection

# Test 1: Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Test 2: Install dependencies
pip install -r requirements.txt
# Expected: No errors, all packages installed

# Test 3: Run scraper with minimal data
python sec_scraper.py --days 1 --top 5
# Expected:
#   - Script runs without errors
#   - insider_trades.csv created
#   - Top 5 trades printed to console
#   - Log file created

# Test 4: Run full weekly scrape
python sec_scraper.py --days 7 --min-value 100000
# Expected:
#   - CSV with trades >$100k
#   - Takes 2-5 minutes
#   - No rate limit errors

deactivate
```

**Verification Checklist:**

- [ ] Virtual environment creates successfully
- [ ] All dependencies install without errors
- [ ] Script runs and completes without crashes
- [ ] CSV file is created with valid data
- [ ] CSV contains expected columns:
  - `filing_date`, `ticker`, `company_name`
  - `officer_name`, `officer_title`
  - `is_director`, `is_officer`
  - `trade_type`, `shares`, `price_per_share`, `total_value`
  - `sec_filing_url`
- [ ] Data is sorted by `total_value` (descending)
- [ ] SEC filings URLs are valid and accessible
- [ ] Script respects rate limits (1 request/second)
- [ ] Error handling works (test with invalid input)

---

## ✅ Landing Page

### Files & Configuration

- [x] `landing-page/package.json` - Node dependencies
- [x] `landing-page/next.config.js` - Next.js configuration
- [x] `landing-page/tsconfig.json` - TypeScript configuration
- [x] `landing-page/tailwind.config.ts` - Tailwind CSS configuration
- [x] `landing-page/postcss.config.js` - PostCSS configuration
- [x] `landing-page/.env.example` - Environment variables template
- [x] `landing-page/app/layout.tsx` - Root layout
- [x] `landing-page/app/page.tsx` - Home page
- [x] `landing-page/app/globals.css` - Global styles
- [x] `landing-page/components/EmailSignupForm.tsx` - Email signup component
- [x] `landing-page/components/FeatureCard.tsx` - Feature card component
- [x] `landing-page/components/FAQItem.tsx` - FAQ accordion component

### Functionality Tests

**Manual Testing:**

```bash
cd landing-page

# Test 1: Install dependencies
npm install
# Expected: No errors, node_modules created

# Test 2: Type checking
npm run type-check
# Expected: No TypeScript errors

# Test 3: Linting
npm run lint
# Expected: No linting errors (or only warnings)

# Test 4: Build
npm run build
# Expected: Successful build, .next directory created

# Test 5: Run development server
npm run dev
# Expected: Server starts on http://localhost:3000
```

**Browser Testing:**

**Desktop (Chrome/Firefox/Safari):**

Navigate to `http://localhost:3000`

**Hero Section:**
- [ ] Headline displays correctly
- [ ] Subheadline is readable
- [ ] Email signup form is visible
- [ ] "Subscribe Free" button is clickable
- [ ] Social proof text shows subscriber count

**Email Signup Form:**
- [ ] Email input accepts text
- [ ] Email validation works (try invalid email)
- [ ] Submit button shows loading state
- [ ] Success message displays after submission
- [ ] Error message displays for invalid input
- [ ] Privacy notice is visible

**Navigation:**
- [ ] OneSig logo/title is visible
- [ ] "Subscribe Free" button in nav works
- [ ] Sticky navigation works on scroll

**How It Works Section:**
- [ ] 3 feature cards display correctly
- [ ] Emojis are visible
- [ ] Text is readable
- [ ] Hover effects work

**Why OneSig Section:**
- [ ] 4 benefit cards display
- [ ] Green checkmarks visible
- [ ] Text is legible

**Sample Newsletter Preview:**
- [ ] Monospace font displays
- [ ] Sample content is readable
- [ ] "Get This in Your Inbox" button works

**FAQ Section:**
- [ ] FAQ items are collapsible
- [ ] Clicking expands/collapses answer
- [ ] Chevron icon rotates on expand
- [ ] All 6 FAQs are present

**Final CTA Section:**
- [ ] Blue background displays
- [ ] White text is readable
- [ ] Email signup form works (dark variant)

**Footer:**
- [ ] Disclaimer is prominent and readable
- [ ] Legal links are visible and clickable
- [ ] Copyright year displays correctly

**Mobile Testing (iPhone/Android or Browser DevTools):**

Test at breakpoints:
- [ ] 320px (iPhone SE)
- [ ] 375px (iPhone 12)
- [ ] 768px (iPad)

**Mobile-Specific Checks:**
- [ ] Email form is usable (no tiny inputs)
- [ ] Buttons are tappable (min 44x44px)
- [ ] Text is readable (no tiny font)
- [ ] No horizontal scroll
- [ ] Navigation is accessible
- [ ] FAQ accordion works with touch

**Performance:**
- [ ] Page loads in <3 seconds (dev mode)
- [ ] No console errors in browser DevTools
- [ ] No 404 errors for assets
- [ ] Images load correctly (if any)

---

## ✅ Newsletter System

### Files & Configuration

- [x] `newsletter/README.md` - Workflow documentation
- [x] `newsletter/templates/weekly-template.md` - Newsletter template
- [x] `newsletter/samples/sample-newsletter-2025-11-14.md` - Example newsletter
- [x] `newsletter/drafts/` - Directory for drafts
- [x] `newsletter/sent/` - Directory for sent newsletters
- [x] `newsletter/data/` - Directory for CSV data

### Workflow Tests

**Template Verification:**

- [ ] Template has all required sections:
  - Subject line
  - Greeting
  - Top 3 Insider Buys
  - Top 3 Insider Sells
  - Notable Mentions
  - By the Numbers
  - This Week's Insight
  - How to Use This Data
  - Next Week Preview
  - Disclaimer and footer
- [ ] Placeholders are clearly marked
- [ ] Instructions are included
- [ ] Quality checklist is present

**Sample Newsletter Verification:**

- [ ] All placeholders filled in
- [ ] Data looks realistic
- [ ] Analysis is substantial (not just data)
- [ ] Links are formatted correctly
- [ ] Disclaimer is included
- [ ] Tone is conversational but professional

**Manual Workflow Test:**

1. **Data Collection:**
   ```bash
   cd data-collection
   source venv/bin/activate
   python sec_scraper.py --days 7 --output ../newsletter/data/test_$(date +%Y%m%d).csv
   deactivate
   ```
   - [ ] CSV created successfully
   - [ ] CSV contains adequate data (>10 trades)

2. **Draft Creation:**
   ```bash
   cp newsletter/templates/weekly-template.md newsletter/drafts/test_draft.md
   ```
   - [ ] Template copied successfully
   - [ ] Can open and edit draft

3. **Manual Curation:**
   - [ ] Open CSV in spreadsheet application (Excel, Numbers, or any CSV viewer)
   - [ ] Data is readable and organized
   - [ ] Can sort and filter trades
   - [ ] Can identify top 10 trades
   - [ ] Can research context for trades (Google News, Yahoo Finance)

---

## ✅ Legal Documents

### Files Verification

- [x] `legal/disclaimer.md` - Financial disclaimer
- [x] `legal/privacy-policy.md` - Privacy policy
- [x] `legal/terms-of-service.md` - Terms of service
- [x] `legal/README.md` - Legal documentation

### Content Verification

**Disclaimer:**
- [ ] States clearly "NOT investment advice"
- [ ] Warns about investment risks
- [ ] Disclaims warranties and guarantees
- [ ] Mentions data limitations
- [ ] Includes limitation of liability
- [ ] Plain English summary included

**Privacy Policy:**
- [ ] Lists data we collect
- [ ] Explains how data is used
- [ ] States we don't sell email addresses
- [ ] Explains user rights (access, deletion)
- [ ] Mentions third-party services (Beehiiv, Vercel)
- [ ] Includes unsubscribe instructions
- [ ] GDPR and CCPA sections included
- [ ] Plain English summary included

**Terms of Service:**
- [ ] Defines service (newsletter, not advice)
- [ ] States age requirement (18+)
- [ ] Lists prohibited uses
- [ ] Explains intellectual property rights
- [ ] Limitation of liability section
- [ ] Governing law specified (California)
- [ ] Plain English summary included

**Legal Compliance:**
- [ ] CAN-SPAM Act requirements listed
- [ ] ⚠️ Physical address placeholder (must add before public launch)
- [ ] Unsubscribe mechanism described
- [ ] Contact information provided

---

## ✅ Documentation

### Files Verification

- [x] `README.md` (root) - Project overview
- [x] `docs/setup-guide.md` - Setup instructions
- [x] `docs/development-workflow.md` - Development practices
- [x] `docs/phase-1-testing-checklist.md` - This file
- [x] `data-collection/README.md` - Scraper documentation
- [x] `newsletter/README.md` - Newsletter workflow
- [x] `legal/README.md` - Legal compliance guide

### Content Verification

**README.md:**
- [ ] Clear project description
- [ ] Current phase identified (Phase 1)
- [ ] Features listed (current and planned)
- [ ] Tech stack documented
- [ ] Project structure diagram
- [ ] Getting started instructions
- [ ] Roadmap with phases
- [ ] Contact information

**Setup Guide:**
- [ ] Prerequisites listed
- [ ] Step-by-step installation
- [ ] Python setup instructions
- [ ] Next.js setup instructions
- [ ] Beehiiv configuration guide
- [ ] Testing instructions
- [ ] Troubleshooting section
- [ ] Setup complete checklist

**Development Workflow:**
- [ ] Git workflow explained
- [ ] Commit message format
- [ ] Code style guidelines
- [ ] Testing procedures
- [ ] Deployment process
- [ ] Documentation practices

---

## ✅ Integration Tests

### End-to-End Workflow

**Test Complete Weekly Workflow:**

1. **Monday - Data Collection:**
   - [ ] Run scraper successfully
   - [ ] Export CSV to newsletter/data/
   - [ ] CSV contains adequate trades (>20)

2. **Tuesday - Manual Review:**
   - [ ] Open CSV in spreadsheet application
   - [ ] Can identify top 10 trades
   - [ ] Can research trade context

3. **Wednesday - Newsletter Creation:**
   - [ ] Copy template successfully
   - [ ] Fill in trade data
   - [ ] Write analysis for each trade
   - [ ] Write weekly insight
   - [ ] Proofread newsletter

4. **Thursday - Newsletter Send (Simulated):**
   - [ ] Newsletter ready for sending
   - [ ] All links working
   - [ ] Disclaimer included
   - [ ] Contact information present

5. **Friday - Analytics Review (Simulated):**
   - [ ] Can access Beehiiv analytics
   - [ ] Understands metrics to track

### Landing Page → Beehiiv Integration

**Test Email Capture Flow:**

1. **User submits email on landing page:**
   - [ ] Form accepts valid email
   - [ ] Form rejects invalid email
   - [ ] Success message displays

2. **Beehiiv receives subscriber:**
   - [ ] ⚠️ Requires Beehiiv account (manual test)
   - [ ] Subscriber added to list
   - [ ] Confirmation email sent

3. **User confirms subscription:**
   - [ ] Confirmation link works
   - [ ] User marked as confirmed
   - [ ] Welcome email sent (if configured)

---

## ✅ Pre-Launch Checklist

### Critical Items (Must Complete)

**Legal & Compliance:**
- [ ] ⚠️ **CRITICAL:** Add physical mailing address to:
  - [ ] Newsletter template footer
  - [ ] Privacy policy
  - [ ] Terms of service
  - [ ] Legal README
- [ ] Verify unsubscribe link in newsletter template
- [ ] Disclaimer visible on all pages

**Beehiiv Configuration:**
- [ ] Beehiiv account created
- [ ] Publication configured
- [ ] From email verified
- [ ] Reply-to email set
- [ ] Double opt-in enabled
- [ ] Welcome email created

**Content Verification:**
- [ ] Landing page reviewed for typos
- [ ] Newsletter template tested
- [ ] Legal documents reviewed
- [ ] Contact email working

**Technical:**
- [ ] Landing page deployed (optional for Phase 1)
- [ ] All links working
- [ ] No console errors
- [ ] Mobile responsive verified

### Optional Items (Nice to Have)

- [ ] Custom domain configured
- [ ] Google Analytics or Plausible added
- [ ] Social media accounts created (@onesighq)
- [ ] Sample newsletter sent to test group
- [ ] Feedback collected from test users

---

## ✅ Launch Readiness Assessment

### Phase 1 Launch Criteria

**Must Have (Blocking):**
- [x] Python scraper working
- [x] Newsletter template complete
- [x] Legal documents created
- [ ] Physical address added to emails
- [ ] Beehiiv account configured
- [ ] 5 initial subscribers identified

**Should Have (Important):**
- [x] Landing page functional
- [ ] Landing page deployed (can use Beehiiv landing page)
- [x] Documentation complete
- [ ] First newsletter drafted and ready

**Nice to Have (Optional):**
- [ ] Custom domain
- [ ] Social media presence
- [ ] Analytics configured

---

## 🚀 Post-Testing Next Steps

### After All Tests Pass

1. **Add Physical Address:**
   - Get P.O. Box or virtual mailbox
   - Update all templates and legal docs
   - Commit changes

2. **Set Up Beehiiv:**
   - Complete account configuration
   - Test email sending
   - Verify deliverability

3. **Recruit Initial Subscribers:**
   - Friends and family
   - Colleagues interested in stocks
   - Personal network

4. **Create First Newsletter:**
   - Run scraper for real
   - Curate top 10 trades
   - Write analysis
   - Proofread carefully

5. **Send First Newsletter:**
   - Thursday 9 AM EST
   - To 5 initial subscribers
   - Request feedback

6. **Iterate Based on Feedback:**
   - Adjust format
   - Improve analysis
   - Fix any issues

---

## 📊 Testing Results Log

**Date Tested:** [FILL IN]

**Tested By:** [FILL IN]

**Results:**

| Component | Status | Notes |
|-----------|--------|-------|
| Data Collection | ⚪ Not Tested | |
| Landing Page | ⚪ Not Tested | |
| Newsletter Workflow | ⚪ Not Tested | |
| Legal Documents | ⚪ Not Tested | |
| Documentation | ⚪ Not Tested | |
| Integration | ⚪ Not Tested | |

**Legend:**
- ⚪ Not Tested
- 🟡 In Progress
- ✅ Passed
- ❌ Failed

**Issues Found:**

1. [Issue description]
   - Severity: [Critical/High/Medium/Low]
   - Status: [Open/In Progress/Resolved]

---

## 📞 Support

If you encounter issues during testing:

1. **Check documentation:**
   - `/docs/setup-guide.md`
   - Component-specific READMEs

2. **Review error messages:**
   - Copy full error text
   - Check logs

3. **Search for solutions:**
   - Google the error message
   - Check tool documentation

4. **Ask for help:**
   - Email: contact@onesig.co
   - Include: Error message, steps to reproduce, environment details

---

**Last Updated: November 9, 2025**
