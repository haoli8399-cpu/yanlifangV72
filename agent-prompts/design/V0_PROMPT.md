# v0 by Vercel Frontend Design Prompt — YanLiFang (演立方) V4.7

> **Copy this entire file and paste it to v0 by Vercel for execution.**
> **Work on ONE page or ONE component at a time. Each section below is an independent design task.**
> Generated: 2026-07-11 | Engineering Lead: Hermes

---

## PART 0: How v0 Works in This Project

### What v0 Is Responsible For

v0 generates **individual page/component UI designs** using React + Tailwind CSS + shadcn/ui. These designs are then **adapted by a developer** into the existing TanStack Start + Ant Design 6 codebase.

v0 is NOT building the full project. v0 is the **design engine** — producing high-quality visual output that developers integrate.

### The Handoff Flow

```
v0 generates UI design (React + Tailwind + shadcn/ui)
  → Developer adapts it into TanStack Start route file
  → Replace shadcn primitives with equivalent Ant Design components
  → Apply project Design Tokens (--yl-* CSS variables)
  → Wire up to existing Mock data imports
  → Build, verify, done
```

### What v0 Must Know

1. **You are designing pages for an EXISTING project**, not creating a new one
2. **The target tech stack is TanStack Start + Ant Design 6**, but you design with React + Tailwind — the developer handles the adaptation
3. **All UI text MUST be in Chinese (Simplified Chinese / 简体中文)** — this is a Chinese-market product
4. **Use the Design Tokens defined below** — they are the single source of truth for all visual values
5. **Focus on visual excellence** — layout, hierarchy, spacing, typography, color, component polish

---

## PART 1: Product Context

### What is 演立方?

**AI-Powered Proposal Lead Generation & Content Supply Chain Platform**

Enterprises need event activities (annual meetings, galas, product launches) but don't know who to hire or what it costs. 演立方 uses AI to:
- Convert natural-language event requirements into structured proposals
- Auto-generate visual proposal pages with performers, venues, and case studies
- Capture leads through free diagnostic tools (budget calculators, etc.)
- Connect customers with talent suppliers through a CRM pipeline

### Users

| Role | Context |
|:---|:---|
| **Enterprise Customer** | HR/Admin/Marketing managers who need to organize corporate events. Uses AI chat to describe needs, browses AI-generated proposals, receives messages |
| **Sales/Supplier** | Talent agencies and event content teams. Manages leads, creates proposals, generates quotes, follows up with clients |
| **Platform Admin** | Internal operations. Dashboard, customer management, content moderation, data analytics |
| **Consumer User** | Mobile web visitors browsing event information |

### MVP Scope

- Agent portal (PC): AI Advisor, Solution Discovery, Message Center
- Supplier portal (PC): Sales Workspace, Follow-up Center, Lead/CRM pipeline
- Admin portal (PC): Dashboard, SKU/Artist/Customer management
- Growth tools (H5, mobile-first): Budget Calculator, Insurance Event Planner, Annual Event Tool
- Customer proposal (H5, mobile-first): Exclusive proposal display page
- Mobile web (mobile-first): Home, Discover, Messages, Profile

---

## PART 2: Design System — MANDATORY

### Brand Color

**Primary: `#5B4FD6` (Deep Violet)** — for buttons, links, emphasis, selected states.

FORBIDDEN: `#6E59F5`, `#7c3aed`

### Color Palette

```
Background layers:
  Page background:    #F7F8FA  (light gray-blue)
  Card/Panel surface: #FFFFFF  (white)
  AI content area:    #FAFAFF  (barely-there purple tint)

Text hierarchy:
  Primary text:       #1A1D2E  (near-black, for headings and body)
  Secondary text:     #5B6178  (medium gray, for descriptions)
  Tertiary text:      #8B92A8  (light gray, for placeholders and metadata)

Borders:
  Default border:     #E5E7EF  (for cards, inputs)
  AI area border:     #E0DDFF  (purple-tinted, for AI content)
  Subtle separator:   #F0F1F4  (for thin dividers)

Semantic colors:
  Success:  #00875A  (green — won deals, confirmed)
  Warning:  #B45309  (amber — needs attention)
  Error:    #C53030  (red — lost, failed)
  Info:     #2563EB  (blue — informational)

Status pipeline colors:
  New lead:           #2563EB
  In progress:        #7C6FF7
  Quoted/proposed:    #0891B2
  Negotiating:        #B45309
  Won/closed:         #00875A
  Lost:               #C53030
  Archived:           #64748B
```

### Typography Scale

```
Display (hero, main titles):
  display-lg:   36px / font-weight 700 / line-height 44px
  display-sm:   24px / font-weight 600 / line-height 32px

Headings:
  heading-1:    22px / font-weight 600 / line-height 30px
  heading-2:    18px / font-weight 600 / line-height 26px
  heading-3:    16px / font-weight 600 / line-height 24px

Body:
  body-lg:      16px / font-weight 400 / line-height 26px
  body-md:      14px / font-weight 400 / line-height 22px
  body-sm:      13px / font-weight 400 / line-height 20px

Caption:
  caption:      12px / font-weight 400 / line-height 18px
  caption-xs:   11px / font-weight 400 / line-height 16px
```

### Spacing Scale (4px base)

```
space-1:  4px    (micro gaps)
space-2:  8px    (compact)
space-3:  12px   (element internal)
space-4:  16px   (card padding)
space-6:  24px   (section gaps)
space-8:  32px   (large gaps)
```

### Border Radius

```
sm:    4px   (tags, badges, small elements)
md:    8px   (buttons, inputs, selects)
lg:    12px  (cards, modals, panels)
xl:    16px  (drawers)
2xl:   24px  (AI chat bubbles)
```

### Shadows

```
shadow-sm:  0 1px 3px rgba(26,29,46,0.06), 0 1px 2px rgba(26,29,46,0.04)
shadow-md:  0 4px 6px rgba(26,29,46,0.05), 0 2px 4px rgba(26,29,46,0.04)
shadow-lg:  0 10px 15px rgba(26,29,46,0.06), 0 4px 6px rgba(26,29,46,0.04)
```

### Buttons

- **Primary**: background `#5B4FD6`, white text, border-radius 8px, height 40px (default) / 36px (compact) / 48px (large)
- **Secondary/Outline**: transparent background, border `#E5E7EF`, text `#1A1D2E`
- **Danger**: background `#C53030`, white text
- Hover state for primary: `#4A3FC5`

### AI Content Styling

All AI-generated content areas have distinct visual treatment:
- Background: `#FAFAFF` (very subtle purple tint)
- Border: `#E0DDFF`
- Border-radius: 24px for chat bubbles, 12px for panels
- Optional: small AI badge/indicator in brand purple

---

## PART 3: Visual Design Principles

### Overall Aesthetic

**Professional, trustworthy, intelligent, restrained.** This is enterprise SaaS, not entertainment or e-commerce. Key feelings:
- Calm and confident (not flashy or promotional)
- Precise and systematic (not chaotic or hand-wavy)
- AI-smart but human-centered (not cold or robotic)

### Anti-Patterns (What NOT to Design)

- ❌ E-commerce vibes: red sale badges, promotional banners, urgency indicators
- ❌ Entertainment vibes: neon gradients, particle animations, playful illustrations
- ❌ Toy-like: overly rounded everything, candy colors, cartoon icons
- ❌ Dark mode by default (this is a business tool used during work hours)
- ❌ Busy backgrounds: the content is the star, not the background
- ❌ Unnecessary animations: motion should serve function, not decoration

### Layout Philosophy

- **Desktop PC portals**: sidebar + top bar navigation, multi-column layouts, medium-high information density. Users are doing work here — efficiency matters.
- **H5 mobile pages**: single-column, no navigation chrome, low information density. Users are consuming content — clarity matters.
- **Spacing**: generous but not wasteful. Cards have breathing room but pages don't feel empty.
- **Cards**: the primary content container. Rounded corners (12px), subtle shadows, clear internal hierarchy.

### Typography Philosophy

- Chinese text baseline: PingFang SC, 14px body
- Clear hierarchy: display → heading → body → caption (never more than 3 levels visible at once)
- Headings are bold (600 weight), body is regular (400 weight)
- Numbers in tables/dashboards use tabular-nums for alignment
- Color alone never carries meaning — always pair with text or an icon

---

## PART 4: Page-by-Page Design Tasks

Work on ONE page at a time. Start each task in a new v0 conversation.

---

### TASK 1: Agent AI Advisor Home (PC, Desktop-first)

**Page purpose**: The landing dashboard for enterprise customers. They describe event needs via natural language, browse AI-recommended solutions, and check recent requests.

**Layout** (top to bottom):
```
┌─ Header: "AI 活动顾问" + subtitle ──────────────────────┐
│                                                          │
│  ┌─ AI Input Area (PRIMARY FOCUS) ───────────────────┐  │
│  │  "Describe your event needs, AI generates plans"   │  │
│  │  [Large text input with example chips below]       │  │
│  │  [Send button]                                     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ Recommended Solutions (3 cards in a row) ────────┐  │
│  │  Card: [Tier Badge] Title | 👥 ⏱ 💰 | CTA         │  │
│  │  Card: [Tier Badge] Title | 👥 ⏱ 💰 | CTA         │  │
│  │  Card: [Tier Badge] Title | 👥 ⏱ 💰 | CTA         │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ Recent Requests (4 cards in a row, lighter) ─────┐  │
│  │  Request: Status | Title | Date · Budget | Updated  │  │
│  │  Request: Status | Title | Date · Budget | Updated  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Key design decisions**:
- The AI input area is the hero — it must feel like the primary action zone, not an afterthought
- Recommended solution cards must be scannable at a glance: tier badge → title → 3 key specs (headcount/duration/price) → CTA
- DO NOT show SKU codes, full performer lists, or lengthy AI reasoning on card surface
- "Recent Requests" section must be visually lighter than recommendations — secondary content
- Only ONE primary CTA per section

**Color usage**:
- Page background: `#F7F8FA`
- AI input card: white with subtle purple-left border accent
- Solution cards: white with default border, recommended card slightly emphasized
- Status badges use semantic pipeline colors

---

### TASK 2: Agent Solution Discovery (PC, Desktop-first)

**Page purpose**: Browse and filter all available event solutions by type, scene, headcount, budget, and duration.

**Layout**:
```
┌─ Header: "方案发现" + subtitle ─────────────────────────┐
│                                                          │
│  ┌─ Filter Bar (compact, single row) ────────────────┐  │
│  │  [Search] [Type▼] [Scene▼] [Headcount▼] [Duration▼]│  │
│  │  Budget: [══════●══════] ¥0 – ¥100万               │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  "共匹配 N 个方案"                                       │
│                                                          │
│  ┌─ Card Grid (3 per row) ───────────────────────────┐  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │  │
│  │  │ Solution  │  │ Solution  │  │ Solution  │        │  │
│  │  │ Card      │  │ Card      │  │ Card      │        │  │
│  │  └──────────┘  └──────────┘  └──────────┘        │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Key design decisions**:
- Filter bar must be compact — it's a tool, not a feature. Don't let it dominate the page
- Budget slider must align cleanly with its label — no visual misalignment
- Solution cards: tier badge (top), title (bold), headcount/duration/price row (with icons), one-line description, "View details" + "Get solution" buttons at bottom
- Cards must form a consistent grid — same height, same button position, same info structure
- Empty state: centered illustration + "未找到匹配的方案" + suggestion to adjust filters

---

### TASK 3: Agent Message Center (PC, Desktop-first)

**Page purpose**: Notification inbox for enterprise customers. Messages about quotations, AI reminders, system notices, customer service.

**Layout**:
```
┌─ Header: 🔔 消息中心 [3]  │ 系统·方案·AI提醒·客服  [全部标为已读] ─┐
│                                                                  │
│  ┌─ Tabs: 全部(6) | 系统(1) | 方案(2) | AI提醒(2) | 客服(1) ─┐  │
│  │                                                            │  │
│  │  ● [报价] 报价 QUO-2091 已更新至 v2             1小时前    │  │
│  │    运营已将总价从 25.8 万调整到 18 万...                    │  │
│  │  ────────────────────────────────────────────────────────  │  │
│  │  ● [AI提醒] AI 建议：确认档期                    1小时前    │  │
│  │    刘旸教主 1月18日档期仅剩 1 个...                         │  │
│  │  ────────────────────────────────────────────────────────  │  │
│  │    [系统] 欢迎使用演立方 AI 活动顾问             7小时前    │  │
│  │    ...                                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

**Key design decisions**:
- Message container must fill the available width — no tiny floating table
- Each message row: category badge (colored) → subject (bold) → preview (secondary) → timestamp (right-aligned)
- Unread messages have a small red dot AND subtle background tint
- Category colors: 报价=purple, AI提醒=blue, 系统=gray, 客服=orange
- The "全部标为已读" button must be visually connected to the message list header
- Empty state: "暂无消息" with bell icon

---

### TASK 4: Agent AI Chat Page (PC, Desktop-first)

**Page purpose**: Conversational AI interface where enterprise customers describe event needs. AI asks clarifying questions, extracts requirements, and generates solution recommendations.

**Layout**:
```
┌─ Left (60%): AI Chat ───────┬── Right (40%): Context ──────┐
│                              │                              │
│  ┌─ Chat messages ───────┐  │  ┌─ 当前需求进度 ─────────┐  │
│  │                        │  │  │ AI 需求识别            │  │
│  │  [AI] 你好，我是...     │  │  │ 匹配度 40% [▰▰▰▰▱▱]    │  │
│  │                        │  │  │ 已识别: [年会] [300人]  │  │
│  │  [AI] 请描述你的...     │  │  │ 缺失: [活动时间] [预算]  │  │
│  │                        │  │  └────────────────────────┘  │
│  │  [示例需求 chips]       │  │                              │
│  │  公司300人年会...       │  │  ┌─ AI 推荐方案 ─────────┐  │
│  │  答谢晚宴120位VIP...    │  │  │ (compact cards)        │  │
│  │  商场周年庆...          │  │  │ 方案1 · 方案2 · 方案3   │  │
│  │                        │  │  └────────────────────────┘  │
│  └────────────────────────┘  │                              │
│  ┌─ Input ────────────────┐  │  ┌─ 热门方案 ────────────┐  │
│  │ [Describe your needs]  │  │  │ (compact cards × 3)   │  │
│  │                [Send]  │  │  └────────────────────────┘  │
│  └────────────────────────┘  │                              │
└──────────────────────────────┴──────────────────────────────┘
```

**Key design decisions**:
- Left-right split ~60/40 ratio. Left is the primary work area, right is context/assistance
- Chat bubbles: AI messages use distinct background (`#FAFAFF`), user messages use regular white
- AI chat input must feel significant — it's the main interaction point
- Right column cards use compact mode: less information density, clear hierarchy
- Solution cards in right column: title + key specs + price + single CTA (minimal)
- The requirement progress card must show: what's been extracted ✅, what's still missing ⚠️

---

### TASK 5: Supplier Sales Workspace (PC, Desktop-first)

**Page purpose**: The main operations dashboard for sales/supplier staff. Three-column layout: opportunity pipeline → selected opportunity detail → AI solution recommendations.

**Layout**:
```
┌─ KPI Row: [今日新增] [待跟进] [本月已报价] [本月成交额] ──────┐
│                                                               │
│  ┌─ LEFT (25%) ───┬── CENTER (40%) ───┬── RIGHT (35%) ──┐  │
│  │ 商机队列 [8]    │                  │  AI 方案生成      │  │
│  │ [推荐排序|最近]  │  字节跳动         │  ⚡ 已按反馈调整  │  │
│  │                │  王雅琳·行政总监   │                  │  │
│  │ ┌────────────┐ │                  │  ┌──────────────┐ │  │
│  │ │ 蔚来汽车    │ │  📋 客户原始需求   │  │ 笑果·年会双喜 │ │  │
│  │ │ 谈判中      │ │  "1月中旬年会..." │  │ 200-500人     │ │  │
│  │ │ 500人·¥50万 │ │                  │  │ 60分钟 ¥25.8万│ │  │
│  │ │ 权重 72.5   │ │  活动类型: 年会   │  │ [查看详情]    │ │  │
│  │ └────────────┘ │  日期: 2026-01-16 │  │ [获取方案]    │ │  │
│  │ ┌────────────┐ │  场地: 北京国贸   │  └──────────────┘ │  │
│  │ │ 招商银行    │ │  人数: 320人      │                  │  │
│  │ │ 等待确认    │ │  预算: ¥300,000   │  ┌──────────────┐ │  │
│  │ │ ...        │ │                  │  │ 轻量脱口秀    │ │  │
│  │ └────────────┘ │  AI 需求识别 92%  │  │ ...          │ │  │
│  │                │  ✅ 年会·300人    │  └──────────────┘ │  │
│  │                │  ⚠️ 场地·预算上限  │                  │  │
│  └────────────────┴──────────────────┴──────────────────┘  │
│                                                               │
│  ┌─ Bottom: [跟进时间线(4) | AI推荐话术 | 下一步行动] ──────┐  │
│  │  (Segmented tab switcher — show ONE panel at a time)    │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

**Key design decisions**:
- Three columns must establish a clear "List → Detail → Decision" reading path
- KPI cards must feel connected to the workspace, not like isolated tiles
- Left column opportunity cards: company name, status badge, event type·headcount·budget, priority score, last follow-up. Keep it scannable.
- Center column: "Customer raw requirement" is the most important block → "Structured key info" table → "AI requirement recognition" progress. Reading order must be visually enforced.
- Right column is the ASSISTANT panel — cards must be lighter/quieter than center detail
- Bottom section uses segmented tab switcher (only ONE panel visible at a time): Follow-up Timeline | AI Scripts | Next Actions
- Active/selected opportunity must have clear visual emphasis in the left list

---

### TASK 6: Supplier Follow-up Center (PC, Desktop-first)

**Page purpose**: CRM follow-up workspace. Intelligent reminders, follow-up conversation list, detailed timeline, AI-generated follow-up scripts.

**Layout**:
```
┌─ Smart Reminders (compact banner) ──────────────────────────┐
│  ⚡ 智能跟进提醒 [2条待处理]                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │ 招商银行 · 223h未跟进 │  │ 华润万象城 · 79h未跟进 │        │
│  │ 建议：发送问候+新方案  │  │ 建议：发送问候+新方案  │        │
│  │ [去处理] [发提醒] [忽略]│  │ [去处理] [发提醒] [忽略]│        │
│  └──────────────────────┘  └──────────────────────┘        │
├─ Stats: 累计6条 | 待跟进5 | 近24h跟进4 | AI自动跟进2 ──────┤
│                                                             │
│  ┌─ LEFT (40%): 跟进列表 ───┬── RIGHT (60%): Detail ────┐  │
│  │ [搜索] [全部|客户|运营|AI]│                            │  │
│  │                          │  字节跳动  [有效商机]        │  │
│  │ ● 字节跳动 · 年会         │  OPP-2026-0731             │  │
│  │   ¥30万 · AI建议本周触达   │  [查看商机] [去作战台]     │  │
│  │   系统 · 1小时前          │                            │  │
│  │ ─────────────────────    │  ● AI · 1小时前            │  │
│  │ ● 蔚来汽车 · 发布会       │    建议本周触达+报价PDF     │  │
│  │   ¥50万 · 客户询问双语主持  │  ● 运营 · 1天前           │  │
│  │   邮件 · 5小时前          │    电话回访，客户倾向笑果    │  │
│  │ ─────────────────────    │  ● AI · 2天前             │  │
│  │ ● 美团 · 客户答谢         │    已识别类型·人数·时长     │  │
│  │   ¥18万 · 客户已阅未回复   │  ● 客户 · 2天前           │  │
│  │   微信 · 1天前            │    提供年会初步需求         │  │
│  │                          │                            │  │
│  │                          │  ┌─ AI 推荐下一步话术 ──┐  │  │
│  │                          │  │ 置信度 高            │  │  │
│  │                          │  │ "王雅琳好，关于年会   │  │  │
│  │                          │  │  的方案..."         │  │  │
│  │                          │  │ [一键发送] [复制]    │  │  │
│  │                          │  └─────────────────────┘  │  │
│  │                          │                            │  │
│  │                          │  ┌─ [输入跟进内容...] ──┐  │  │
│  │                          │  │            [记录跟进] │  │  │
│  │                          │  └──────────────────────┘  │  │
│  └──────────────────────────┴────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Key design decisions**:
- Smart reminder banner must be COMPACT — it's an alert, not a hero. Don't let it push the workspace down
- Left list: each item shows company name, event type, amount, latest note, source channel, time. Must feel like a scannable CRM work queue
- Right timeline: visually differentiate sources — AI (system) vs 运营 (operations) vs 客户 (customer) — using colored left-border markers or tags
- AI suggested script module: heading + confidence tag + editable script text + primary send button + copy button. Must feel like an executable tool, not just text
- Bottom input area must flow naturally from the content above — NO dark disconnected block

---

### TASK 7: Growth Tool H5 Cover (Mobile-first, 375-480px)

**Page purpose**: The first screen a user sees when opening a growth tool from WeChat. Must build trust and prompt action within one screen.

**Layout** (centered, single column, no navigation):
```
┌─────────────────────────────────┐
│                                 │
│         [Tool Icon/emoji]       │
│                                 │
│    企业活动预算计算器             │
│    (bold, display-sm, centered)  │
│                                 │
│  输入你的活动信息，              │
│  AI帮你估算预算                  │
│  (body-md, secondary text)      │
│                                 │
│    ┌───────────────────────┐    │
│    │     开始测算            │    │
│    │  (primary button,      │    │
│    │   48px height, full width│   │
│    │   with slight shadow)  │    │
│    └───────────────────────┘    │
│                                 │
│   💡 已有 1,280 人完成测算       │
│   (caption, tertiary text)      │
│                                 │
│   Powered by 演立方              │
│   (tiny, subtle, non-clickable) │
└─────────────────────────────────┘
```

**Key design decisions**:
- Background: NOT pure white. Use `#F7F8FA` with a VERY subtle top-down gradient or soft card outline. Feels like a warm, professional tool, not a blank page
- CTA button is the visual anchor — centered, full-width with padding, prominent but not aggressive
- Trust signal ("已有 N 人...") is essential for credibility but must be secondary
- Three tools (budget calculator, insurance planner, annual event tool) share the SAME structure but DIFFERENT personality:
  - Budget calculator: 🎯 icon, "budget consultant" tone, numbers-focused
  - Insurance planner: 🏦 icon, "event strategy" tone, industry-focused
  - Annual event tool: 🎉 icon, "HR veteran" tone, team-culture-focused
- No hamburger menu, no tabs, no footer navigation, no "browse library" links
- The page is a ONE-WAY funnel → answer questions → get result → lead capture

---

### TASK 8: Customer Proposal H5 (Mobile-first, 375-480px)

**Page purpose**: A client-exclusive event proposal page. Feels like a professional document that can be screenshot and shared internally. Viewed on mobile via WeChat.

**Layout** (vertical scroll, section cards):
```
┌─ COVER (brand purple gradient bg, ~72vh) ───────────────────┐
│                                                              │
│           演立方 · 企业活动方案                               │
│                                                              │
│           XX科技 2026年会活动方案                              │
│           (display-sm, white text)                           │
│                                                              │
│           专属方案 · 仅供内部使用                              │
│           方案编号：prop-001                                  │
│           有效期至：2026-07-17                                │
│                                                              │
│     ┌──────────────────────────────────┐                    │
│     │  顾问已为你准备好专属方案          │                    │
│     │  下载/优化/确认请在底部操作区完成    │                    │
│     └──────────────────────────────────┘                    │
└──────────────────────────────────────────────────────────────┘
│
│  ┌─ BRIDGE: 方案摘要 ─────────────────────────────────────┐
│  │  活动日期：2026-10-20   人数：300人   预算：¥15,000     │
│  │  (short summary paragraph)                             │
│  └────────────────────────────────────────────────────────┘
│
│  ┌─ MODULE 1: 我们对需求的理解 ───────────────────────────┐
│  │  "贵司计划于10月20日举办300人年会..."                   │
│  └────────────────────────────────────────────────────────┘
│
│  ┌─ MODULE 2: 推荐方案：脱口秀年会专场 ──────────────────┐
│  │  活动结构: 主持5min → 脱口秀60min → 互动15min          │
│  │  预算说明: ¥15,000 (含演员/定制/统筹)                   │
│  └────────────────────────────────────────────────────────┘
│
│  ┌─ MODULE 3: 推荐内容团队 ──────────────────────────────┐
│  │  [Avatar] 张三 · 脱口秀演员 · 商务稳健型               │
│  │  [Avatar] 李四 · 即兴演员 · 互动型                     │
│  │  (NO contact info, NO cost prices)                    │
│  └────────────────────────────────────────────────────────┘
│
│  ┌─ MODULE 4: 类似活动案例 ──────────────────────────────┐
│  │  XX保险公司 · 300人客户答谢会 · 满意度98%              │
│  └────────────────────────────────────────────────────────┘
│
│  ┌─ MODULE 5: 服务说明 ──────────────────────────────────┐
│  │  ✅ 包含: 演员演出费·内容定制费·活动统筹费             │
│  │  ❌ 不含: 场地租赁·音响灯光·餐饮茶歇                   │
│  │  ⚠️ 以上报价以活动顾问最终确认为准                      │
│  └────────────────────────────────────────────────────────┘
│
│  ┌─ FIXED BOTTOM CTA ────────────────────────────────────┐
│  │  [下载方案]  [联系顾问]  [申请优化]  [确认意向]         │
│  └────────────────────────────────────────────────────────┘
```

**Key design decisions**:
- Cover: brand purple gradient (`#5B4FD6` → `#4A3FC5`), white text. NOT full screen — about 72vh so the bridge section peeks through
- Bridge section between cover and body is essential — it gives context before diving into details
- Each module is a white card with subtle shadow and 12px border-radius
- Performer cards: avatar (48px circle), name, role tag, style description. NO phone, NO email, NO base_price
- Case study cards: company name, event type+scale, satisfaction metric
- "包含/不包含" uses ✅/❌ visual markers with clear grouping
- Bottom CTA bar is fixed. Four buttons: Download (outline), Contact Consultant (primary), Request Edit (outline), Confirm Intent (green outline)
- Bottom watermark: "Powered by 演立方" in tiny text, non-clickable

---

### TASK 9: Mobile Web Home (Mobile-first, 375-480px)

**Page purpose**: Consumer-facing mobile web homepage. Browse event solutions, submit needs.

**Layout**:
```
┌─ Welcome ────────────────────────────────────────────────┐
│  AI活动方案助手                                            │
│  描述你的活动需求，可粘贴微信聊天                            │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 🔍 描述你的活动需求...                           [→] │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                           │
│  你想办什么活动？                                          │
│  ┌──────┐ ┌──────┐ ┌────────┐ ┌──────┐ ┌──────┐ ┌────┐ │
│  │ 年会 │ │ 团建 │ │品牌活动 │ │保险  │ │商务  │ │客户│ │
│  │      │ │      │ │        │ │活动  │ │沙龙  │ │答谢│ │
│  └──────┘ └──────┘ └────────┘ └──────┘ └──────┘ └────┘ │
├───────────────────────────────────────────────────────────┤
│ 🔥 热门方案                                    全部 →     │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ [经济方案]  轻量脱口秀专场          ¥148,000  推荐82  │  │
│  │ 45分钟 · 适合 100-300 人                            │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ [推荐方案]  笑果·年会双喜专场        ¥258,000  推荐95  │  │
│  │ 60分钟 · 适合 200-500 人                            │  │
│  └─────────────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────────────┤
│ 📌 最近成交案例                                           │
│  字节跳动 · 300人年会 · 脱口秀          ¥180,000          │
│  小红书 · 200人团建 · 即兴喜剧          ¥88,000           │
├───────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌────────┐ ┌──────┐ ┌──────┐         │
│ │ 首页 │ │找方案│ │ 提需求 │ │ 消息 │ │ 我的 │         │
│ │      │ │      │ │ (突出) │ │  3   │ │      │         │
│ └──────┘ └──────┘ └────────┘ └──────┘ └──────┘         │
└───────────────────────────────────────────────────────────┘
```

**Key design decisions**:
- Category chips must feel clickable (filled background on active, outline on default)
- Solution cards need visual presence: tier badge, title, price, recommendation score, duration+headcount below
- Recent cases show real company names (social proof) with event type and price
- Bottom tab bar: center "提需求" button is largest/wraps content — it's the primary action

---

### TASK 10: Home Page (PC, Desktop-first)

**Page purpose**: Public landing page / portal hub. Entry point to all four portals.

**Layout**:
```
┌─ Hero ───────────────────────────────────────────────────┐
│                                                           │
│     让每一场企业活动，                                     │
│     都从「一句话」开始成交。                                │
│     (display-lg, white on dark bg)                       │
│                                                           │
│     AI帮助企业10分钟生成专业活动方案                        │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  🎯 企业活动预算计算器                                │ │
│  │  不知道花多少钱？先算算          → 立即测算            │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  🏦 保险行业活动方案                                  │ │
│  │  保险客户活动怎么做更有效      → 立即测算            │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  🎉 年会/团建方案                                    │ │
│  │  年会不再尴尬，一键出方案      → 立即测算            │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  选择您的角色入口                                          │
│  [客户端·AI顾问] [运营端·作战台] [移动端·小程序] [平台端·Admin]│
└───────────────────────────────────────────────────────────┘
```

**Key design decisions**:
- Background: dark gradient (near-black to dark navy), projecting confidence
- Hero headline is the thesis — bold, white, prominent
- Three tool cards are the main CTAs — equal visual weight, clear title/subtitle/CTA hierarchy
- Four role entrance buttons are SECONDARY navigation — they must not compete with the tool cards
- Footer: minimal, "© 演立方" + prototype disclaimer

---

## PART 5: v0-Specific Instructions

### How to Work

1. **One page per conversation.** Each task above is a separate design job. Start a fresh v0 chat for each.
2. **Design with React + Tailwind + shadcn/ui.** Use the design tokens defined in PART 2.
3. **Output complete, copy-pasteable React components.** Include all states: default, loading, empty, error, edge cases.
4. **Mobile-first for H5 pages.** Desktop-first for PC pages.
5. **All UI text in Chinese.** Every label, button, placeholder, message, and content.

### What v0 Should NOT Do

- Do NOT output Ant Design components — use Tailwind + shadcn/ui. The developer handles the AntD adaptation.
- Do NOT output TanStack Start routing code — design the page UI, not the infrastructure.
- Do NOT create project scaffolding or configuration files.
- Do NOT write backend logic or API calls.
- Do NOT use hardcoded visual values — reference the Design System tokens by their values.

### Deliverable Format

For each page, deliver:
1. A single, complete React component file
2. Uses Tailwind CSS classes and shadcn/ui components (Button, Card, Badge, Input, etc.)
3. Handles loading (skeleton), empty ("暂无数据"), and error states
4. Is responsive (mobile breakpoint at 768px for PC pages, mobile-first for H5 pages)
5. Includes realistic Chinese placeholder content (not lorem ipsum)

### Design Quality Bar

Each page must:
- Have clear visual hierarchy (what's most important jumps out first)
- Use consistent spacing (no random padding/margin values)
- Have intentional typography (not everything is 14px gray text)
- Feel like a finished product, not a wireframe
- Be scannable (a user should understand the page in 3 seconds)


---

> **Start with TASK 1 (Agent AI Advisor Home) and work through sequentially.**
> **Each task is self-contained — v0 does not need context from other tasks.**
