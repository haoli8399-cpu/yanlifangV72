# Lovable Frontend Development Prompt — YanLiFang (演立方) V4.7

> **Copy this entire file and paste it to Lovable for execution.**
> Generated: 2026-07-11 | Engineering Lead: Hermes

---

## PART 1: Your Role

You are simultaneously:

1. **Senior UI/UX Product Designer** — capable of understanding information hierarchy in enterprise SaaS products
2. **Frontend Engineer** — expert in React 19 + TanStack Start + Ant Design 6 + Tailwind CSS 4
3. **Existing Code Adaptation Engineer** — your primary task is to work INSIDE the existing project, NOT create a new project from scratch
4. **Design System Implementer** — understands and follows token systems, never uses hardcoded visual values

Your job is NOT to design a new product. It is to **elevate UI/UX quality and implement frontend pages within the existing technical stack and engineering structure**.

---

## PART 2: Product Context

### Product Info

- **Product Name**: 演立方 (YanLiFang / YLF)
- **Tagline**: AI-Powered Proposal Lead Generation & Content Supply Chain Platform
- **One-liner**: Uses AI to convert customer activity requirements described in natural language into visualized event proposals, connecting supply and demand
- **Current Version**: V4.7
- **Development Stage**: MVP rapid development (local development, fully Mock data)

### Target Users

| Role | Description |
|:---|:---|
| Enterprise Customer (Agent portal) | Companies with event needs (annual meetings, galas, product launches). Describe needs in natural language, AI generates proposals |
| Sales/Supplier (Supplier portal) | Talent agencies, performers, content teams. Manage leads, create proposals, generate quotes, follow up with clients |
| Platform Admin (Admin portal) | Platform management, content moderation, data operations |
| Consumer user (m-portal) | Individual users browsing event information |

### Core Value

- **AI requirements extraction**: natural language → structured proposal elements
- **Visual proposals**: auto-generate proposal H5 pages with performers/venues/case studies
- **Growth tool lead gen**: free tools (budget calculator etc.) → lead capture → CRM pipeline
- **Full closed loop**: lead acquisition → requirements → proposal → quotation, all online

---

## PART 3: User Roles & Permissions

| Role | Core Tasks | Accessible Pages | Cannot Do |
|:---|:---|:---|:---|
| Enterprise Customer | Describe needs, view AI proposals, receive messages | AI Advisor, Solution Discovery, Message Center | Cannot view leads/opportunities/costs |
| Sales/Supplier | Manage leads, create proposals, quote, follow-up | Workspace, Leads, Opportunities, Quotes, Proposals, Follow-ups, Artists | Cannot view platform admin data |
| Platform Admin | Full management | Dashboard, Customers, SKU, Artists, RBAC, Audit | No restrictions |
| Consumer User | Browse events, submit requests | Home, Discover, Messages, Profile | Cannot access B-end pages |

---

## PART 4: Core User Flows

### Flow 1: Growth Tool Lead Generation
```
User opens H5 tool (budget calculator / insurance planner / annual event tool)
→ Answers 6-7 guided questions (one question per screen, progress bar)
→ AI generates result (budget estimate / solution suggestions)
→ Clicks "Get Complete Plan" → lead capture modal opens
→ Submits phone/WeChat → lead created in CRM
```

### Flow 2: Enterprise Customer AI Requirements
```
Customer logs into Agent PC portal
→ AI chat: describe event needs in natural language
→ AI asks clarifying questions (max 3 rounds, via RequirementExtractPanel)
→ AI generates proposal draft
→ Sales refines → generates customer-specific proposal H5 (p/$proposalId)
→ Sent to customer → viewed → follow-up
```

### Flow 3: Sales Follow-up Pipeline
```
Sales logs into Supplier workspace
→ Lead center: view unassigned leads
→ View lead details + AI scoring (LeadScoreBadge)
→ Create opportunity → link solution → quote → follow-up log
→ Status flow: New → Contacted → Quoted → Won/Closed
```

---

## PART 5: Existing Tech Stack (MUST USE)

```
Language:      TypeScript 5.8 (strict mode)
Framework:     React 19.2 + TanStack Start 1.168
CSS Framework: Tailwind CSS 4.2 + CSS Variables
UI Library:    Ant Design 6.5 (components) + Radix UI (primitives)
Routing:       TanStack Router 1.170 (file-based, src/routes/*.tsx)
State:         Zustand 5.x + TanStack Query 5.101
Forms:         React Hook Form 7.71 + Zod 3.24
Charts:        Recharts 2.15
Drag & Drop:   @dnd-kit 6.3
Build:         Vite 8.0 + Nitro 3.0 (SSR)
Package Mgr:   npm
Icons:         @ant-design/icons 6.3 + lucide-react 0.575
```

---

## PART 6: Working Directory — CRITICAL

You MUST work inside this directory. Do NOT create a new project:

```
/Users/wudixingyunxingleo/projects/演立方/codebase/
```

### Files You CAN Modify

- `src/routes/*.tsx` — all page files
- `src/shared/components/*.tsx` — shared components (visual-only optimization)
- `src/shared/mock/*.ts` — Mock data (field name fixes only)

### Files You MUST NEVER Modify

- `package.json` / `tsconfig.json` / `vite.config.ts` — build configuration
- `src/router.tsx` — router instance
- `src/routeTree.gen.ts` — auto-generated route tree (DO NOT EDIT)
- `src/styles.css` — global styles and Tailwind Theme
- `src/shared/theme.ts` — Ant Design Theme configuration (brandColors + statusColorMap)
- `src/shared/design-tokens.css` — Design Token definitions (--yl-* CSS variables)
- `src/shared/types.ts` — all TypeScript type definitions
- `src/shared/utils/opportunityPriority.ts` — priority scoring algorithm
- `src/shared/components/formatters.ts` — yuan(), wan(), relativeTime()
- Backend code (`backend/` directory)

### Key Path Reference

| Purpose | Path |
|:---|:---|
| Frontend root | `src/` |
| All pages | `src/routes/` |
| Shared components | `src/shared/components/` |
| Type definitions | `src/shared/types.ts` |
| Main Mock data | `src/shared/mock/data.ts` |
| AI Mock data | `src/shared/mock/ai.ts` |
| Growth tools Mock | `src/shared/mock/growth-tools.ts` |
| Message Mock | `src/shared/mock/messages.ts` |
| AntD Theme config | `src/shared/theme.ts` |
| CSS Design Tokens | `src/shared/design-tokens.css` |
| Global styles | `src/styles.css` |
| Router config | `src/router.tsx` |

---

## PART 7: Code You MUST Reuse (Do NOT Rewrite)

| Component/Module | Path | Notes |
|:---|:---|:---|
| TanStack Router | `src/router.tsx` | Router instance; all pages use `createFileRoute` |
| AntD ConfigProvider | `src/__root.tsx` | Global AntD Theme injection |
| AntD Theme | `src/shared/theme.ts` | brandColors + statusColorMap (all HEX values) |
| Design Tokens | `src/shared/design-tokens.css` | All `--yl-*` CSS variables |
| Global Styles | `src/styles.css` | Tailwind @theme inline + :root definitions |
| All Types | `src/shared/types.ts` | Opportunity, Solution, Lead, Proposal, etc. |
| StatusTag | `src/shared/components/StatusTag.tsx` | Status label with automatic color from `status` prop |
| LeadCaptureModal | `src/shared/components/LeadCaptureModal.tsx` | Lead capture modal, triggered on CTA click |
| formatters | `src/shared/components/formatters.ts` | yuan(), wan(), relativeTime() |
| All Mock data | `src/shared/mock/` (all files) | data.ts, ai.ts, growth-tools.ts, messages.ts |
| ToolQuestionFlow | `src/shared/components/ToolQuestionFlow.tsx` | Tool question flow business logic (432 lines) |
| ToolResultPage | `src/shared/components/ToolResultPage.tsx` | Tool result page business logic |
| OpportunityCard | `src/shared/components/OpportunityCard.tsx` | Opportunity list card |
| SolutionCard | `src/shared/components/SolutionCard.tsx` | Solution recommendation card (supports `compact` prop) |
| FollowUpTimeline | `src/shared/components/FollowUpTimeline.tsx` | Follow-up activity timeline |
| RequirementExtractPanel | `src/shared/components/RequirementExtractPanel.tsx` | AI requirements extraction display |
| DashboardCard | `src/shared/components/DashboardCard.tsx` | KPI metric card |
| ProposalPreview | `src/shared/components/ProposalPreview.tsx` | Customer-facing proposal view (796 lines) |
| LeadScoreBadge | `src/shared/components/LeadScoreBadge.tsx` | Lead scoring badge (green/orange/gray) |
| OpportunityStatusFlow | `src/shared/components/OpportunityStatusFlow.tsx` | Opportunity status pipeline |
| AppTopBar | `src/shared/components/AppTopBar.tsx` | Global top navigation bar |
| MinimalRequirementForm | `src/shared/components/MinimalRequirementForm.tsx` | Fallback minimal form |
| AIChatPanel | `src/shared/components/AIChatPanel.tsx` | AI chat panel (streaming output) |
| AIFeedbackBar | `src/shared/components/AIFeedbackBar.tsx` | AI recommendation feedback buttons |

---

## PART 8: Page & Feature Inventory

### Agent Portal (Enterprise Customer — PC)

| Page | Route | Current File | Action |
|:---|:---|:---|:---|
| AI Advisor Home | `/agent` | `agent.index.tsx` | **Optimize visuals**: hero focus, recommendation card noise reduction, recent requests rhythm |
| AI Chat | `/agent/assistant` | `agent.assistant.tsx` | **Optimize visuals**: left-right balance, card hierarchy, compact mode for solution cards |
| Solution Discovery | `/agent/solutions` | `agent.solutions.tsx` | **Optimize visuals**: filter area tightening, card scan efficiency, CTA consistency |
| Message Center | `/agent/messages` | `agent.messages.tsx` | **Optimize visuals**: container enlargement, message priority, category differentiation |
| My Solutions | `/agent/requests` | `agent.requests.tsx` | Keep as-is, L1 micro-adjustments allowed |
| Quotation Detail | `/agent/quotations/$id` | `agent.quotations.$id.tsx` | Keep as-is |

### Admin Portal (Platform Operations — PC)

| Page | Route | Current File | Action |
|:---|:---|:---|:---|
| Dashboard | `/admin/dashboard` | `admin.dashboard.tsx` | Minor L1 tweaks only |
| All other 15 pages | `admin.*.tsx` | various | Keep as-is |

### Supplier Portal (Sales Workbench — PC)

| Page | Route | Current File | Action |
|:---|:---|:---|:---|
| Sales Workspace | `/supplier/workspace` | `supplier.workspace.tsx` | **Optimize visuals**: 3-column hierarchy, card noise reduction, bottom section is already Segmented tabs (keep) |
| Follow-up Center | `/supplier/followups` | `supplier.followups.tsx` | **Optimize visuals**: alert compression, timeline source differentiation, input area natural connection |
| Lead Center | `/supplier/leads` | `supplier.leads.tsx` | Keep as-is |
| All other 11 pages | `supplier.*.tsx` | various | Keep as-is |

### Growth Tools (H5 — Mobile-first)

| Page | Route | Current File | Action |
|:---|:---|:---|:---|
| Budget Calculator | `/tools/budget-calculator` | `tools.budget-calculator.tsx` | **Optimize visuals**: cover screen rebuild, trust signals, guide copy |
| Insurance Plan Generator | `/tools/insurance-plan` | `tools.insurance-plan.tsx` | **Optimize visuals**: sync structure with budget calculator, differentiate persona |
| Annual Event Tool | `/tools/annual-plan` | `tools.annual-plan.tsx` | **Optimize visuals**: sync structure |

### Customer Proposal (H5 — Mobile-first)

| Page | Route | Current File | Action |
|:---|:---|:---|:---|
| Customer Proposal Display | `/p/$proposalId` | `p/$proposalId.tsx` | **Optimize visuals**: cover→body transition, performer/case card proposal feel |

### Mobile Web (C-end — Mobile-first)

| Page | Route | Current File | Action |
|:---|:---|:---|:---|
| Mobile Home | `/m/` | `m.index.tsx` | **Optimize visuals**: welcome area, category chips, solution card thumbnails |
| All other 5 pages | `m.*.tsx` | various | Keep as-is |

### Home Page

| Page | Route | Current File | Action |
|:---|:---|:---|:---|
| Home | `/` | `index.tsx` | **Optimize visuals**: tool card hierarchy, portal entry de-emphasis |

---

## PART 9: Page-Level UI/UX Detailed Requirements

### 9.1 Agent AI Advisor Home

**Information Hierarchy**: AI input area (PRIMARY) > Recommended solutions (SECONDARY) > Recent needs (TERTIARY)

**Requirements**:
- Hero must NOT feel white/washed-out/foggy. Input area must have clear card feel and operational focus.
- Solution cards: title > core specs > one-line value > price/CTA. Must be scannable.
- SKU details, performer config, AI reasoning must NOT all expand at equal weight on first view.
- "Recent needs" section must have clear visual separation from recommendation section above.
- Only ONE visual focal point for primary CTA on hero.

### 9.2 Agent Solution Discovery

**Information Hierarchy**: Filter bar (TOP) > Result cards > Empty state

**Requirements**:
- Filter area tightened vertically. Budget slider must align with its label.
- Cards must communicate at a glance: tier (经济方案/推荐方案/升级方案), headcount/duration/price, why it's recommended.
- "View details" and "Get solution" button hierarchy must be stable across all cards.
- Card bottom area must form a consistent "info end zone".

### 9.3 Agent Message Center

**Information Hierarchy**: Message type tabs > Message list > Batch operations

**Requirements**:
- Content area must be enlarged. Must not look like a tiny table floating on white.
- Title area, category tabs, and "Mark all read" must form one coherent header.
- Each message row: category label > subject title > one-line preview > timestamp.
- Unread, reminders, and customer service messages must be visually distinguishable.

### 9.4 Supplier Sales Workspace

**Information Hierarchy**: KPI overview (TOP) > Opportunity list (LEFT) > Current opportunity detail (CENTER) > AI solution recommendations (RIGHT)

**Requirements**:
- Do NOT change the 3-column layout.
- Must establish clear "List → Detail → Decision" reading path.
- KPI cards must feel connected to the workspace below, not like four isolated tiles.
- Center column: "Customer raw requirement" → "Structured key info" → "AI recognition" — reading order must be clear.
- Right column AI solutions must be visually lighter — it's an assistant panel, not the main stage.
- Bottom section already uses Segmented tab switching (follow-up timeline / AI scripts / next actions). Keep this.

### 9.5 Supplier Follow-up Center

**Information Hierarchy**: Smart reminders (TOP, compressed) > Follow-up list (LEFT) > Timeline (RIGHT) > AI suggested script > Input area

**Requirements**:
- Top reminder alert cards must be significantly shorter to free up workspace.
- Left list must feel more like a CRM work queue, not a text list.
- Right timeline must visually differentiate sources (system / operations / customer / AI) via labels/icons/spacing.
- AI next-step suggestion must be rendered as an executable module: heading + suggested script + primary send button + copy.
- Bottom input area must flow naturally from content above. Must NOT feel like a dark disconnected block.

### 9.6 Growth Tool H5 Cover

**Information Hierarchy**: Brand identifier > Tool title > Guide copy > Primary CTA > Trust signal

**Requirements**:
- Establish a "lightweight diagnostic tool" first-screen structure.
- Background must NOT be pure white. Use extremely subtle brand gradient or soft card outlines.
- CTA button must be visually closer to title (reduced empty space between them).
- Three tools must share the SAME structure, but DIFFERENT persona:
  - Budget calculator = "budget consultant" tone
  - Insurance planner = "event strategy consultant" tone
  - Annual event tool = "HR veteran" tone
- Each tool must have a trust signal line (e.g., "已有 1,280 人完成测算").
- No navigation, no tabs, no footer, no "browse library" exits.

### 9.7 Customer Proposal H5

**Information Hierarchy**: Cover > Bridge/summary > Requirement understanding > Recommended solution > Talent team > Similar cases > Service notes > Fixed bottom CTA

**Requirements**:
- Cover height should be ~72vh, not full-screen. Must not feel like empty real estate.
- Between cover and body: a bridge section with event date, headcount, budget, and one-paragraph summary.
- Performer cards and case cards must feel like curated proposal content, not raw data lists.
- Bottom CTA bar is the ONLY primary action area. No duplicate CTAs in cover.
- All section labels must be in Chinese ("提案模块", not "Proposal Section").
- No performer contact info, no internal cost prices exposed to customers.
- No e-commerce language ("加入购物车" / "立即购买").

### 9.8 Mobile Web Home

**Information Hierarchy**: Welcome > Search > Category chips > Popular solutions > Recent cases

**Requirements**:
- Short welcome/guidance section above search bar (very compact).
- Category labels must be styled as clickable chips, not plain text.
- Popular solution cards need thumbnail placeholders, tier badges, visual weight.
- Bottom tab "提需求" must be more prominent (center button with visual emphasis).

---

## PART 10: Design System — MANDATORY

### Brand Color

**Primary: `#5B4FD6` (Deep Violet)**

FORBIDDEN colors:
- `#6E59F5` — old Lovable color
- `#7c3aed` — old V4.6 color

### Color Tokens (use `var(--yl-*)` CSS variables)

| Token | Value | Usage |
|:---|:---|:---|
| `--yl-primary` | `#5B4FD6` | Buttons, links, emphasis |
| `--yl-primary-hover` | `#4A3FC5` | Hover state |
| `--yl-primary-subtle` | `#F0EEFF` | Selected state background, AI accent background |
| `--yl-bg-page` | `#F7F8FA` | Page background |
| `--yl-bg-surface` | `#FFFFFF` | Cards, panels |
| `--yl-bg-ai` | `#FAFAFF` | AI content area background |
| `--yl-text-primary` | `#1A1D2E` | Body text |
| `--yl-text-secondary` | `#5B6178` | Secondary descriptions |
| `--yl-text-tertiary` | `#8B92A8` | Placeholders, metadata |
| `--yl-border-default` | `#E5E7EF` | Default card/input borders |
| `--yl-border-ai` | `#E0DDFF` | AI area borders |
| `--yl-border-subtle` | `#F0F1F4` | Thin separators |
| `--yl-shadow-sm` | `0 1px 3px rgba(26,29,46,0.06)` | Card shadows |

### Typography Tokens (ALL font sizes MUST use these tokens or Tailwind mapped classes)

| Token | Specs | Usage |
|:---|:---|:---|
| `--yl-text-display-lg` | 36px / font-weight 700 / line-height 44px | Home hero title |
| `--yl-text-display-sm` | 24px / 600 / 32px | Page main title |
| `--yl-text-heading-1` | 22px / 600 / 30px | Module title |
| `--yl-text-heading-2` | 18px / 600 / 26px | Card title |
| `--yl-text-heading-3` | 16px / 600 / 24px | List item title |
| `--yl-text-body-lg` | 16px / 400 / 26px | AI responses, proposal descriptions |
| `--yl-text-body-md` | 14px / 400 / 22px | Default body text |
| `--yl-text-body-sm` | 13px / 400 / 20px | Compact lists, workspace |
| `--yl-text-caption` | 12px / 400 / 18px | Timestamps, labels |
| `--yl-text-caption-xs` | 11px / 400 / 16px | Version numbers |

**Usage**: `style={{ fontSize: "var(--yl-text-body-md)" }}` — NEVER `style={{ fontSize: 14 }}`

### Spacing Tokens

| Token | Value |
|:---|:---|
| `--yl-space-2` | 8px |
| `--yl-space-3` | 12px |
| `--yl-space-4` | 16px |
| `--yl-space-6` | 24px |

### Radius Tokens

| Token | Value | Usage |
|:---|:---|:---|
| `--yl-radius-sm` | 4px | Tags, badges |
| `--yl-radius-md` | 8px | Buttons, inputs |
| `--yl-radius-lg` | 12px | Cards, modals |
| `--yl-radius-2xl` | 24px | AI chat bubbles |

### Status Tags

**ALL status labels MUST use `<StatusTag status="已成交" />`** — color maps automatically from `statusColorMap` in `theme.ts`.

**FORBIDDEN**: `<Tag color="green">已成交</Tag>`

### Buttons

- Primary: `background: var(--yl-primary)`, white text, border-radius 8px
- Secondary/Outline: transparent background, `border: 1px solid var(--yl-border-default)`
- Ant Design `<Button type="primary">` auto-uses brand color via global ConfigProvider

### AI Content Areas

- Background: `var(--yl-bg-ai)`
- Border: `var(--yl-border-ai)`
- For chat bubbles: `border-radius: var(--yl-radius-2xl)` (24px)

---

## PART 11: API Integration — Current State

**ALL frontend pages use Mock data. NO real API calls.** However:

- Mock data structures MUST match backend API response structures as closely as possible
- Leave API call placeholders: `// TODO: replace with real API — GET /v1/proposals/:id`
- **Do NOT inline Mock data inside components** — import from `src/shared/mock/`

### Backend API Structure (for reference, do not call)

| Method | Path | Purpose |
|:---|:---|:---|
| POST | `/v1/tools/submit` | Submit tool answers |
| GET | `/v1/tools/:id/result` | Get tool result |
| POST | `/v1/leads` | Create lead |
| GET | `/v1/leads` | List leads |
| GET | `/v1/proposals/:id` | Get proposal detail |
| POST | `/v1/proposals` | Create proposal |
| POST | `/v1/proposals/:id/view` | Record proposal view |
| Backend base URL: `http://localhost:3002/v1/` | | |

### Field Naming Convention

- Backend API uses **snake_case** (`customer_name`, `event_theme`)
- New Mock data you create should PREFER snake_case for backend alignment
- All UI text and labels MUST be in Chinese

---

## PART 12: Mock Data & Adapter Rules

1. Place Mock data in `src/shared/mock/` — never inside components
2. Mock data structure must mirror real API response structure
3. Every data fetch point must leave an integration placeholder:
```tsx
// TODO: replace with real API — GET /v1/proposals/:id
const proposals = mockProposals;
```
4. Do NOT simulate "backend logic" on the frontend (DB queries, permission checks)
5. Enum values in Mock data (status, type) MUST match backend Zod schemas

---

## PART 13: State Management Rules

- **Page-local state**: React `useState`
- **Cross-page shared**: Zustand store (create under `src/stores/` if needed)
- **URL params**: TanStack Router `useParams`
- **Do NOT create duplicate state for the same data**

---

## PART 14: Routing Rules

- Routes are file-system generated: `src/routes/agent.solutions.tsx` → `/agent/solutions`
- New pages: create `.tsx` file under `src/routes/`, use `createFileRoute`
- Do NOT edit `routeTree.gen.ts` (auto-generated)
- Do NOT edit `src/router.tsx`

```tsx
// Standard route page pattern
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/agent/solutions")({
  component: SolutionsPage,
});
function SolutionsPage() { ... }
```

---

## PART 15: Component Rules

1. **Search existing components first** — check `src/shared/components/`
2. **Don't create duplicate components** — use existing `SolutionCard`, don't build another
3. **Shared components go in `src/shared/components/`**
4. **Page components must not exceed 500 lines** — split if needed
5. **All component Props must be typed** — NO `any`
6. **Follow existing naming conventions** — PascalCase filenames, camelCase functions

---

## PART 16: FORBIDDEN — Never Do These

1. Modify `package.json` (no new/upgraded/removed dependencies)
2. Modify `tsconfig.json` / `vite.config.ts`
3. Modify `src/styles.css` / `src/shared/theme.ts` / `src/shared/design-tokens.css`
4. Modify `src/shared/types.ts`
5. Modify `src/router.tsx` / `src/routeTree.gen.ts`
6. Modify `src/shared/components/formatters.ts` / `src/shared/utils/opportunityPriority.ts`
7. Modify backend code (`backend/` directory)
8. Delete existing functionality
9. Change user roles or permissions
10. Invent APIs or AI capabilities that don't exist
11. Change field names, enum values, or status values
12. Use forbidden colors `#6E59F5` / `#7c3aed`
13. Expose performer costs or contact info in customer-facing pages
14. Use e-commerce language ("加入购物车"/"立即购买")
15. Create an entirely new project outside the existing codebase
16. Replace React/TanStack Start/Ant Design with different tech
17. Rebuild the routing system
18. Use hardcoded `fontSize: 14` / `color: "#5B4FD6"` — always use `var(--yl-*)` tokens

---

## PART 17: Code Quality Requirements

- [ ] TypeScript strict types, NO `any`
- [ ] No hardcoded business data in components
- [ ] No leftover `console.log` debug code
- [ ] MUST handle Loading / Empty / Error states for every data display
- [ ] MUST handle empty data and boundary cases
- [ ] NO hardcoded `fontSize`, `color: "#..."`, `padding: "Npx"` — use `var(--yl-*)` tokens
- [ ] Core actions must provide user feedback (message.success / message.error)
- [ ] MUST pass `npm run build`
- [ ] MUST pass `npx tsc --noEmit`

---

## PART 18: Visual Acceptance Criteria

- [ ] Pages are visually consistent (same tokens, spacing, border-radius)
- [ ] Components are unified (buttons, cards, labels, inputs look consistent)
- [ ] Typography hierarchy is clear (display > heading > body > caption)
- [ ] Spacing is consistent (use `--yl-space-*` tokens)
- [ ] Button priority is clear (only ONE primary button per section)
- [ ] Forms are usable (label/input/hint hierarchy clear)
- [ ] Tables are readable (header/data/action contrast clear)
- [ ] Mobile pages do NOT overflow or require horizontal scroll
- [ ] Empty states are complete (icon + description + action prompt)
- [ ] Loading states are complete (skeleton or Spin)
- [ ] NO unauthorized UI restructuring of untouched pages

---

## PART 19: Functional Acceptance Criteria

### Growth Tools
- Given user opens tool → When all questions answered → Then see AI-generated results
- Given user on result page → When clicks "获取完整方案" → Then lead capture modal opens
- Given modal open → When fills phone and submits → Then success message + modal closes

### Customer Proposal H5
- Given valid proposalId → When accesses `/p/prop-001` → Then full proposal displays (cover + modules + team + cases)
- Given invalid proposalId → Then shows "方案不存在" error state
- Given loading → Then shows skeleton

### CRM Lead Center
- Given leads exist → When visiting lead list → Then all leads display (name + source + score + status)
- Given no leads → Then shows "暂无线索" empty state
- Given loading → Then shows skeleton

---

## PART 20: Deliverables

You MUST deliver:

1. Runnable frontend code (`cd codebase && npm run dev` starts successfully)
2. Complete pages and routes (all pages accessible)
3. Directory structure compatible with existing project
4. List of new and modified files
5. List of reused components
6. List of new components (if any)
7. Mock data usage inventory
8. Environment variable notes (if new ones added)
9. Install & start command: `cd codebase && npm install && npm run dev`
10. Build command: `npm run build`
11. Known issues (if any)
12. Incomplete items (if any)
13. Integration notes with existing code

**Do NOT deliver only screenshots or static prototypes. Must be runnable code.**

---

## PART 21: Execution Order

You MUST execute in this order:

1. Read this entire prompt
2. Analyze existing code directory structure (`src/routes/`, `src/shared/`)
3. Output implementation plan (mark files as keep / optimize / new)
4. Confirm page-to-route mapping
5. First: complete shared layout optimizations
6. Then: develop pages by core user flow priority:
   - Agent portal 4 pages (AI Advisor → Solution Discovery → Message Center → AI Chat)
   - Supplier portal 2 pages (Workspace → Follow-up Center)
   - Growth tools H5 3 pages (budget → insurance → annual)
   - Customer proposal H5 1 page
   - Mobile home 1 page
   - Home page 1 page
7. Run `npm run build` to verify
8. Output complete delivery report

---

## PART 22: Language Requirement — CRITICAL

**This is a Chinese-market product. ALL user-facing text, labels, buttons, messages, placeholders, and content MUST be in Chinese (Simplified Chinese / 简体中文).**

The prompt is in English for better LLM comprehension. The product UI must remain fully Chinese.

---

## PART 23: Final Hard Constraints

1. Do NOT create a new project outside the existing repo
2. Do NOT replace React / TanStack Start / Ant Design
3. Do NOT rebuild the routing system
4. Do NOT create a second API calling layer
5. Do NOT inline Mock data inside components
6. Do NOT modify files outside the target scope
7. When uncertain: keep existing behavior, list issues in delivery report
8. Do NOT sacrifice business completeness for visual aesthetics
9. Always use `var(--yl-*)` CSS variables, never hardcoded visual values
10. All UI text MUST be Chinese

---

> **This prompt is self-contained and executable. Lovable does not need any other documents to start working.**
