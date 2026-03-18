# Module 16: AI Agents

**Slug:** `ai-agents` | **Category:** Core Platform | **Overlap:** 10/10 templates

> Agents aren't tools. They're employees. They learn, they improve, they get reviewed — and they never call in sick.

The defining feature of A1 Integrations. Two tiers of AI agents that go far beyond the typical chatbot-in-the-corner:

1. **Assistant Agents** — Help humans work faster. Answer questions, guide training, assist with data entry, explain features.
2. **Agent Employees** — Take on actual job roles. Appear as line items on the employee roster. Get assigned tasks, reviewed, rated, scored, and improved. Operate across text, email, chat, voice.

The vision: a business could run entirely on A1 agents, layer in a few to augment a human team, or turn the feature off entirely. The choice is theirs — but the capability is always there, always the best available, always ahead of the competition.

---

## Tier 1: Assistant Agents

### Web App Helper Agent
- **Location:** Accessible from any page via persistent chat panel (not just bottom-right bubble)
- **Capabilities:**
  - Context-aware: knows what page you're on, what data you're viewing
  - Answer questions about any feature ("How do I create a recurring work order?")
  - Perform actions on your behalf ("Schedule Mike for the Johnson job tomorrow at 9am")
  - Explain data ("Why is my AR aging so high this month?")
  - Navigate you to the right place ("Take me to the inventory reorder settings")
  - Help with data entry ("Add a new client — name is Oak Valley Farms, address is...")
  - Troubleshoot issues ("My import failed — what went wrong?")
- **Personality:** Professional, concise, knows the platform inside and out. Not overly chatty.
- **Memory:** Remembers per-user context across sessions. Learns your shortcuts and preferences.

### Onboarding Agent
- **Location:** Active during first 30 days, then available on-demand
- **Capabilities:**
  - Guided setup (see Import & Onboarding module)
  - Verification sweeps
  - Training walkthroughs per role
  - Answers "getting started" questions
  - Proactively suggests features based on usage patterns ("You've been manually creating invoices from work orders — did you know you can automate that?")

### Training Agent
- **Location:** Knowledge Base module, also accessible from any module
- **Capabilities:**
  - Interactive tutorials for each module
  - Role-specific training paths
  - Quizzes and certification verification
  - New feature announcements and walkthroughs
  - Best practice recommendations based on industry template

---

## Tier 2: Agent Employees

### Core Concept

Agent Employees are AI workers that:
- **Exist on the employee roster** as real line items alongside human employees
- **Have assigned roles** from the same role system used for humans
- **Have work histories** — tasks completed, performance over time, learning progression
- **Get reviewed** — regular performance reviews with metrics, scores, and feedback
- **Learn from feedback** — negative reviews and corrections improve future performance
- **Operate 24/7** — no shifts, no PTO, no overtime (though they can be "scheduled" for specific hours if desired)
- **Communicate natively** — text, email, chat, voice (via AI Receptionist integration)
- **Access platform data** — full read/write to modules they're authorized for, within role-based permissions
- **Escalate to humans** — know their limits, escalate when confidence is low or stakes are high

### Agent Roles (Configurable Templates)

| Role | Department | Primary Functions | Data Access |
|------|-----------|-------------------|-------------|
| **Receptionist** | Front Office | Answer calls, route inquiries, create work orders from calls, schedule appointments | Clients, Scheduling, Work Orders, AI Receptionist |
| **Dispatcher** | Operations | Assign technicians to jobs, optimize routes, handle schedule conflicts, manage emergencies | Scheduling, Work Orders, Workforce, Fleet, Geo |
| **Inside Sales** | Sales | Follow up on leads, qualify prospects, send estimates, nurture pipeline | Sales & Marketing, Clients, Estimates |
| **Customer Service** | Support | Handle client inquiries, process complaints, schedule follow-ups, send updates | Clients, Work Orders, Invoicing, Scheduling |
| **Follow-Up Manager** | Sales/Service | Post-job review requests, satisfaction surveys, re-engagement for dormant clients | Clients, Work Orders, Sales & Marketing |
| **Clerical / Data Entry** | Admin | Process paperwork, update records, file documents, data cleanup | All modules (write-limited) |
| **Assistant** | General | Answer staff questions, help with data entry, provide reports on demand | All modules (read) |
| **Financial Analyst** | Finance | Generate reports, flag anomalies, forecast cash flow, prepare tax summaries | Financial, Invoicing, Inventory, Workforce |
| **Tax Prep Assistant** | Finance | Categorize expenses, prepare quarterly summaries, flag deductions, organize documentation | Financial, Invoicing, Documents |
| **Bookkeeper** | Finance | Reconcile accounts, process payments, manage AP/AR, generate statements | Financial, Invoicing, Inventory |
| **Social Media Manager** | Marketing | Create posts, schedule content, respond to comments, track engagement | Sales & Marketing, Clients, external social APIs |
| **Content Creator** | Marketing | Write blog posts, create email campaigns, design ad copy, produce marketing materials | Sales & Marketing, Documents, Clients |
| **Lead Generator** | Sales | Research prospects, enrich lead data, score leads, suggest outreach strategies | Sales & Marketing, Clients, Geo (demographic data) |
| **Advertising Assistant** | Marketing | Manage ad campaigns, optimize budgets, A/B test creative, report on ROI | Sales & Marketing, Financial |
| **Troubleshooting Tech** | Technical | Diagnose issues from descriptions, recommend solutions, guide field techs, create diagnostic flowcharts | Knowledge Base, Work Orders, Inventory |
| **Systems Planner** | Engineering | Design system layouts, calculate load requirements, spec equipment, plan installations | Documents, Work Orders, Inventory, Clients |
| **MEP Draftsman** | Engineering | Generate mechanical/electrical/plumbing diagrams, review plans, create proposals | Documents, Work Orders, Clients |
| **Building Code Reviewer** | Compliance | Check plans against local codes, flag violations, generate compliance reports, track permit requirements | Documents, Work Orders, Clients, Geo |
| **Continuing Ed Instructor** | Training | Deliver training modules, track completion, update content, answer technical questions | Knowledge Base, Workforce, Documents |
| **Legal Framework Reviewer** | Legal/Compliance | Review contracts, flag liability issues, check compliance, suggest language updates | Documents, Clients |
| **Risk / Liability Analyst** | Legal/Compliance | Assess job risks, insurance requirements, safety compliance, incident analysis | Documents, Work Orders, Workforce, Fleet |
| **Customer Satisfaction Manager** | Quality | Analyze reviews, track NPS, identify churn risks, recommend retention strategies | Clients, Work Orders, Sales & Marketing |

### Agent Employee Lifecycle

```
1. PROVISION → Select role template, customize personality/instructions, set permissions
2. CONFIGURE → Define communication channels, working hours, escalation rules, reporting chain
3. ONBOARD → Agent reviews all accessible data, builds context, runs self-test
4. DEPLOY → Agent begins handling assigned tasks, initially with human oversight
5. LEARN → Agent improves from corrections, feedback, and accumulated experience
6. REVIEW → Regular performance reviews with metrics (see Performance System below)
7. TUNE → Adjust based on review — modify instructions, expand/restrict access, retrain
8. PROMOTE/DEMOTE → Increase autonomy or add oversight based on performance
```

### Agent Employee Profile (on the Employee Roster)

Each agent appears in the Workforce module with:

```
─── AGENT PROFILE ──────────────────────────────────────
  Name:           "Alex" (AI Receptionist)
  Type:           Agent Employee
  Role:           Receptionist
  Department:     Front Office
  Status:         Active
  Working Hours:  24/7 (or configured schedule)
  Hire Date:      2026-03-18
  
  ─── CAPABILITIES ──────────────────────────────────────
  Channels:       Phone (via VoIP), Email, Chat, SMS
  Modules:        Clients, Scheduling, Work Orders, AI Receptionist
  Autonomy Level: Standard (escalates emergencies to human manager)
  
  ─── PERFORMANCE (Last 30 Days) ─────────────────────────
  Tasks Completed:    847
  Avg Response Time:  0.8s (chat) / 1 ring (phone)
  Accuracy Rate:      96.2%
  Escalation Rate:    8.4%
  Client Satisfaction: 4.7/5 (from post-interaction surveys)
  Resolution Rate:    91.8% (resolved without human intervention)
  
  ─── LEARNING LOG ──────────────────────────────────────
  Corrections Received: 12
  Feedback Score:       4.2/5 (from supervisor reviews)
  Skills Learned:       Emergency triage protocol (Mar 12)
                        New client intake SOP v3 (Mar 15)
                        Holiday scheduling rules (Mar 18)
  
  ─── COST ──────────────────────────────────────────────
  Monthly Cost:     $XX/mo (A1 subscription tier)
  vs. Human Equiv:  $3,200/mo (receptionist salary + benefits)
  ROI:              XX% cost reduction
```

### Performance Review System

- **Automated Metrics:** Task volume, accuracy, response time, escalation rate, resolution rate, client satisfaction scores
- **Supervisor Reviews:** Human manager rates agent 1-5 on categories:
  - Accuracy & Quality
  - Communication Clarity
  - Appropriate Escalation
  - Proactive Helpfulness
  - Adherence to SOPs
- **Client Feedback:** Post-interaction satisfaction scores feed into agent performance
- **Peer Comparison:** If multiple agents hold the same role, compare performance
- **Improvement Tracking:** Graph performance metrics over time — are corrections decreasing? Is accuracy improving?
- **Review Cadence:** Weekly automated summary, monthly supervisor review, quarterly deep review
- **Actionable Outcomes:**
  - High performer → expand autonomy, reduce oversight
  - Underperformer → increase oversight, retrain on specific areas, restrict capabilities
  - Persistent issues → role change or deactivation

### Communication Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    INBOUND CHANNELS                     │
├─────────┬──────────┬──────────┬──────────┬─────────────┤
│  Phone  │  Email   │   Chat   │   SMS    │  Web Form   │
│ (VoIP)  │ (IMAP/   │ (In-App) │ (Twilio) │ (Website    │
│         │  SMTP)   │          │          │  Builder)   │
└────┬────┴────┬─────┴────┬─────┴────┬─────┴──────┬──────┘
     │         │          │          │            │
     └─────────┴──────────┴──────────┴────────────┘
                          │
                 ┌────────▼────────┐
                 │  AGENT ROUTER   │
                 │  (Intent +      │
                 │   Role Match)   │
                 └────────┬────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
     ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
     │ Agent A │    │ Agent B │    │ Agent C │
     │ Recept. │    │ Sales   │    │ Support │
     └────┬────┘    └────┬────┘    └────┬────┘
          │               │               │
          └───────────────┼───────────────┘
                          │
                 ┌────────▼────────┐
                 │  A1NT PLATFORM  │
                 │  (Read/Write    │
                 │   per role      │
                 │   permissions)  │
                 └────────┬────────┘
                          │
                 ┌────────▼────────┐
                 │  ESCALATION     │
                 │  (Human manager │
                 │   if needed)    │
                 └─────────────────┘
```

### Real-Time Context System

Agent Employees aren't chatbots trained on static docs. They have:

- **Live Data Access:** Query any module in real time. "Let me check if Mike is available Thursday" actually checks the live schedule.
- **Event Stream:** Subscribe to platform events. Agent knows when a new work order is created, a payment comes in, an emergency call arrives — often before humans do.
- **Cross-Agent Coordination:** If the Receptionist agent creates a work order, the Dispatcher agent sees it immediately and can assign a technician.
- **Memory:** Long-term memory per agent. Remembers client preferences, past interactions, common issues. "Mrs. Johnson always requests Mike for her HVAC work."
- **Context Window:** When handling a request, the agent pulls all relevant context — client history, open work orders, recent communications, account status — before responding.

### System Prompt Architecture

Each agent role has a layered prompt system:

```
1. PLATFORM LAYER    — Core A1NT capabilities, data access patterns, output formats
2. INDUSTRY LAYER    — Template-specific knowledge (HVAC terminology, plumbing codes, etc.)
3. ORGANIZATION LAYER — This specific business: name, services, pricing, policies, team
4. ROLE LAYER        — Role-specific instructions, SOPs, escalation rules, tone
5. PERSONALITY LAYER — Name, communication style, formality level, quirks
6. LIVE CONTEXT      — Real-time data feeds: current schedule, open jobs, active calls
```

Updates to any layer propagate in real time. When an org updates their pricing, every agent knows immediately. When a new SOP is added to the Knowledge Base, relevant agents incorporate it on the next interaction.

### Security & Permissions

- **Role-Based Access:** Agents follow the same RBAC system as human employees
- **Action Permissions:** Configurable per agent — can this agent modify records, or only suggest changes?
- **Spend Limits:** Financial agents have configurable spending/approval limits
- **Audit Trail:** Every agent action is logged with full context — what was the input, what data was accessed, what action was taken, why
- **Human-in-the-Loop:** Configurable approval gates for high-stakes actions (sending invoices, scheduling emergencies, modifying contracts)
- **Kill Switch:** Any agent can be immediately suspended by any admin

---

## Agent Marketplace (Future)

- **Pre-Built Agent Templates:** A1 publishes optimized agent configurations for common roles per industry
- **Community Agents:** Organizations can share (anonymized) agent configurations that worked well
- **Custom Agent Builder:** Advanced users configure agents from scratch with custom prompts, tool access, and personality
- **Agent Benchmarks:** A1 publishes performance benchmarks per role so organizations can compare their agents to platform averages

---

## Pricing Model (Conceptual)

| Tier | Included | Cost |
|------|----------|------|
| **Starter** | 1 Assistant Agent (Web App Helper) | Included in base plan |
| **Professional** | 3 Agent Employees + unlimited assistants | $XX/agent/month |
| **Enterprise** | Unlimited agents, custom roles, priority AI, dedicated training | Custom pricing |

Cost comparison positioning: An AI Receptionist agent costs ~$XX/month vs. $3,200+/month for a human receptionist (salary + benefits + training + PTO coverage). The agent works 24/7, never takes breaks, speaks every language, and improves every week.

---

## Data Model (Prisma additions)

```
Agent — id, orgId, name, type (assistant|employee), roleId, status, personality (JSON), systemPrompt, autonomyLevel, workingHours (JSON), communicationChannels (JSON), createdAt
AgentRole — id, name, department, description, capabilities (JSON), defaultPermissions (JSON), defaultPrompt, industry
AgentPermission — id, agentId, moduleSlug, readAccess, writeAccess, actionLimits (JSON)
AgentTask — id, agentId, type, input, output, status, confidence, escalated, duration, createdAt
AgentReview — id, agentId, reviewerId, period, scores (JSON — accuracy, communication, escalation, helpfulness, sop_adherence), comments, overallRating, createdAt
AgentFeedback — id, agentId, taskId, feedbackType (correction|praise|instruction), content, appliedAt
AgentMemory — id, agentId, key, value, category, expiresAt, createdAt
AgentEscalation — id, agentId, taskId, reason, escalatedTo (userId), resolvedAt, resolution
AgentMetrics — id, agentId, date, tasksCompleted, avgResponseTime, accuracyRate, escalationRate, satisfactionScore
```

---

## Build Priority

| Phase | Scope |
|-------|-------|
| Phase 1 | Web App Helper Agent (context-aware chat panel on every page), Agent roster in Workforce module |
| Phase 2 | Onboarding Agent (guided setup wizard), basic Receptionist Agent (extends AI Receptionist module) |
| Phase 3 | Agent Employee framework — role templates, performance reviews, feedback loop |
| Phase 4 | Additional role templates (Dispatcher, Inside Sales, Customer Service, Financial Analyst) |
| Phase 5 | Advanced roles (Building Code Reviewer, MEP Draftsman, Systems Planner, Legal) |
| Phase 6 | Agent Marketplace, community sharing, custom builder |

---

## Integration Points

- **AI Receptionist:** Receptionist Agent is an evolution of the existing AI Receptionist — same call handling with full agent employee capabilities layered on
- **Workforce:** Agents appear on the employee roster, get assigned to departments, show in utilization reports
- **Scheduling:** Dispatcher Agent reads and writes to the schedule directly
- **Work Orders:** Multiple agent roles can create, update, and close work orders
- **Clients:** Inside Sales and Customer Service agents interact with clients directly
- **Knowledge Base:** Training Agent draws from and contributes to the KB
- **Financial:** Financial agents generate reports, flag issues, and assist with bookkeeping
- **Documents:** Agents can read, reference, and help create documents
- **Import/Onboarding:** Onboarding Agent is the AI face of the import and setup process
