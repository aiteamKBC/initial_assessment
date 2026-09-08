# English & Maths Diagnostic Dashboard

## 1. Project Description
A single-page web dashboard for education staff to monitor learner diagnostic scores in English and Maths. Connects to live Google Sheets data via public CSV endpoints, identifies learners below Level 2, highlights weakest diagnostic areas, and enables coach-level filtering. No authentication required - purely a data visualisation and filtering tool for internal staff use.

## 2. Page Structure
- `/` - Main Dashboard (single page application)

## 3. Core Features
- [ ] Google Sheets CSV data fetching (English + Maths tabs)
- [ ] Data cleaning and normalisation
- [ ] Subject selector (All / English / Maths)
- [ ] Summary KPI cards (6 cards, clickable to filter)
- [ ] Filter bar (Search, Coach, Status, Subject, Diagnostic Result, Exemption, Weak Area)
- [ ] Sortable, paginated learner support table
- [ ] Weakest area calculation
- [ ] Learner details side panel with English/Maths tabs
- [ ] Key Insights section (4 insight cards)
- [ ] Simple charts (Donut + 2 horizontal bar charts)
- [ ] Data Quality section (collapsible)
- [ ] Export filtered CSV
- [ ] Auto-refresh every 5 minutes + manual refresh
- [ ] Responsive design (desktop/tablet/mobile)

## 4. Data Model Design
No persistent database needed. All data is fetched on-the-fly from Google Sheets CSV endpoints.

### CSV Data Sources
- English: `https://docs.google.com/spreadsheets/d/16-TRmdvt8RPdf1UcwQnbDWqINIO64XWTS8MRRKYwv6c/gviz/tq?tqx=out:csv&sheet=English`
- Maths: `https://docs.google.com/spreadsheets/d/16-TRmdvt8RPdf1UcwQnbDWqINIO64XWTS8MRRKYwv6c/gviz/tq?tqx=out:csv&sheet=Maths`

### Processed Learner Record (TypeScript interface)
- coachName, learnerName, email, status
- englishExemption, englishIAScore (number | null)
- englishDiagnostics: { reading, spag, writing, readingText, readingWord, spelling, punctuation, grammar, writingText }
- mathsExemption, mathsIAScore (number | null)
- mathsDiagnostics: { number, mss, statsData, wholeNumbers, calculations, fdpRatio, measure, shape, handlingInfo, statistics }

## 5. Backend / Third-party Integration Plan
- **Supabase**: Not required
- **Shopify**: Not required
- **Stripe**: Not required
- **Google Sheets**: Direct CSV fetch via public endpoint (no API key needed if sheet is shared as "Anyone with the link")

## 6. Development Phase Plan

### Phase 1: Data Layer + Core Dashboard Shell ✅ COMPLETED
- Goal: Fetch CSV data, clean/normalise, build core data processing utilities, display KPI cards and basic learner table
- Deliverable: Working data pipeline + summary cards + filterable learner table
- Status: All 8 tasks completed — data hooks, CSV parser, header, subject selector, KPI cards, filter bar, learner table, learner detail panel, insights, charts, data quality, coach summary, export, loading/empty/error states, auto-refresh

### Phase 2: Filters, Sorting, Pagination + Export ✅ (merged into Phase 1)
- All filtering, sorting, pagination, and CSV export implemented in Phase 1

### Phase 3: Charts, Insights + Data Quality ✅ (merged into Phase 1)
- Donut chart, bar charts, key insights cards, data quality section all implemented

### Phase 4: Learner Details Panel + Polish ✅ (merged into Phase 1)
- Side panel with English/Maths detail tabs, responsive layout, all states handled