# Module: Unified Messages & Assistant Agent

## Overview
A unified communications hub that consolidates all customer interactions — phone calls (including voicemails), SMS, and email — into threaded conversations. Paired with an AI Assistant agent that can autonomously handle message responses based on configurable modes.

This module replaces the need for employees to check multiple disconnected views (call logs, SMS inbox, email) and gives them a single, prioritized stream of customer communications with AI-powered response automation.

---

## Architecture

### Core Concept: Message Threads
Every communication with a contact is grouped into a single **thread** regardless of channel. A thread with "John Smith" might contain:
- An inbound call (voicemail transcription)
- An outbound SMS follow-up
- An inbound email reply
- An AI-drafted response awaiting approval

Each message within a thread carries its channel type (phone/sms/email) so the employee sees the full conversation timeline with channel indicators.

### Thread Resolution
Threads are resolved by matching on contact identity:
1. **Phone number** — normalized E.164 format matches across calls and SMS
2. **Email address** — matches email logs
3. **CRM Client link** — if a Client record has both phone and email, all channels merge into one thread

### Tri-State Read Status (Per Employee)
Each thread has a status from the perspective of each employee:
- 🔴 **UNREAD** — New message(s) arrived, not yet viewed
- 🟡 **READ** — Employee opened/viewed but hasn't replied or actioned
- 🟢 **RESOLVED** — Employee replied, or manually marked resolved

### Assistant Agent States
The assistant operates in one of four modes per employee:
- **OFF** — No AI involvement. Manual inbox only.
- **FULL_AUTO** — Agent processes all incoming messages automatically. Responds where confident, escalates where not.
- **QUEUE_FOR_APPROVAL** — Agent drafts responses to all messages, queues them for employee review before sending.
- **OUT_OF_OFFICE** — Agent replies to all incoming messages with a static OOO message. No AI reasoning.

---

## Data Model

### New Models

```prisma
// ─── Message Thread ────────────────────────────────────────────────
// Groups all communications with a single contact across channels.
model MessageThread {
  id              String            @id @default(cuid())
  organizationId  String
  organization    Organization      @relation(fields: [organizationId], references: [id])

  // Contact resolution
  contactName     String?           // Display name (resolved from CRM or message headers)
  contactPhone    String?           // E.164 normalized phone (links calls + SMS)
  contactEmail    String?           // Email address (links email logs)
  clientId        String?           // Link to CRM Client if resolved
  client          Client?           @relation(fields: [clientId], references: [id])

  // Thread metadata
  subject         String?           // Email subject or auto-generated topic
  lastMessageAt   DateTime          // Timestamp of most recent message (for sorting)
  lastChannel     MessageChannel    // Channel of most recent message
  lastPreview     String?           // Snippet of last message (for inbox list)
  messageCount    Int               @default(0)

  // Relationships
  messages        ThreadMessage[]
  readStatuses    MessageReadStatus[]
  draftResponses  DraftResponse[]

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@index([organizationId, lastMessageAt])
  @@index([contactPhone])
  @@index([contactEmail])
  @@index([clientId])
}

// ─── Thread Message ────────────────────────────────────────────────
// Individual message within a thread. Points to the source record
// (CallRecord, SmsLog, or EmailLog) for full details.
model ThreadMessage {
  id              String            @id @default(cuid())
  threadId        String
  thread          MessageThread     @relation(fields: [threadId], references: [id], onDelete: Cascade)

  // Message content
  channel         MessageChannel    // PHONE, SMS, EMAIL
  direction       MessageDirection  // INBOUND, OUTBOUND
  senderName      String?
  senderAddress   String?           // Phone number or email address
  preview         String?           // First ~200 chars of message body
  body            String?           // Full message body (for SMS/email)

  // Source record links (exactly one should be set)
  callRecordId    String?           @unique
  callRecord      CallRecord?       @relation(fields: [callRecordId], references: [id])
  smsLogId        String?           @unique
  smsLog          SmsLog?           @relation(fields: [smsLogId], references: [id])
  emailLogId      String?           @unique
  emailLog        EmailLog?         @relation(fields: [emailLogId], references: [id])

  // Voicemail-specific
  hasVoicemail    Boolean           @default(false)
  voicemailUrl    String?           // Audio file URL
  transcription   String?           // Auto-transcribed text

  // AI Assistant metadata
  isAiGenerated   Boolean           @default(false)
  aiConfidence    Float?            // 0-1 confidence score on AI response

  createdAt       DateTime          @default(now())

  @@index([threadId, createdAt])
}

// ─── Message Read Status ───────────────────────────────────────────
// Per-employee read state for each thread.
model MessageReadStatus {
  id              String            @id @default(cuid())
  threadId        String
  thread          MessageThread     @relation(fields: [threadId], references: [id], onDelete: Cascade)
  employeeId      String
  employee        Employee          @relation(fields: [employeeId], references: [id])

  status          ReadStatus        @default(UNREAD)  // UNREAD, READ, RESOLVED
  lastReadAt      DateTime?
  resolvedAt      DateTime?

  @@unique([threadId, employeeId])
  @@index([employeeId, status])
}

// ─── Draft Response ────────────────────────────────────────────────
// AI-drafted responses awaiting employee approval (QUEUE_FOR_APPROVAL mode).
model DraftResponse {
  id              String            @id @default(cuid())
  threadId        String
  thread          MessageThread     @relation(fields: [threadId], references: [id], onDelete: Cascade)

  // Draft content
  channel         MessageChannel    // Which channel to send via
  body            String            // Proposed response text
  subject         String?           // For email responses
  recipientAddress String           // Phone or email to send to

  // AI metadata
  confidence      Float?            // 0-1 how confident the AI is
  reasoning       String?           // Why the AI chose this response
  escalationNote  String?           // If escalated: why the AI couldn't handle it

  // Approval workflow
  status          DraftStatus       @default(PENDING) // PENDING, APPROVED, EDITED, REJECTED, SENT, ESCALATED
  reviewedBy      String?           // Employee ID who reviewed
  reviewedAt      DateTime?
  editedBody      String?           // If employee modified before sending
  sentAt          DateTime?

  createdAt       DateTime          @default(now())

  @@index([threadId, status])
}

// ─── Assistant Configuration ───────────────────────────────────────
// Per-employee assistant settings.
model AssistantConfig {
  id              String            @id @default(cuid())
  employeeId      String            @unique
  employee        Employee          @relation(fields: [employeeId], references: [id])
  organizationId  String

  // Mode
  mode            AssistantMode     @default(OFF)  // OFF, FULL_AUTO, QUEUE_FOR_APPROVAL, OUT_OF_OFFICE

  // Out of Office settings
  oooMessage      String?           // Static OOO reply text
  oooUntil        DateTime?         // Auto-disable OOO after this date

  // Full Auto / Queue settings
  systemPrompt    String?           // Custom instructions for the AI assistant
  allowedChannels MessageChannel[]  @default([SMS, EMAIL])  // Which channels the assistant can respond on
  maxConfidence   Float             @default(0.8)  // Below this → escalate to employee
  autoEscalateKeywords String[]     @default([])   // Keywords that always escalate

  // Notification preferences
  notifyOnEscalation  Boolean       @default(true)
  notifyOnNewThread   Boolean       @default(false)

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
}
```

### New Enums

```prisma
enum MessageChannel {
  PHONE
  SMS
  EMAIL
}

enum MessageDirection {
  INBOUND
  OUTBOUND
}

enum ReadStatus {
  UNREAD
  READ
  RESOLVED
}

enum DraftStatus {
  PENDING       // Awaiting employee review
  APPROVED      // Employee approved, ready to send
  EDITED        // Employee modified, ready to send
  REJECTED      // Employee rejected the draft
  SENT          // Response was sent to customer
  ESCALATED     // AI couldn't handle, needs human
}

enum AssistantMode {
  OFF
  FULL_AUTO
  QUEUE_FOR_APPROVAL
  OUT_OF_OFFICE
}
```

### Relation Updates (Existing Models)
- `CallRecord` → add `threadMessage ThreadMessage?`
- `SmsLog` → add `threadMessage ThreadMessage?`
- `EmailLog` → add `threadMessage ThreadMessage?`
- `Employee` → add `messageReadStatuses MessageReadStatus[]`, `assistantConfig AssistantConfig?`

---

## UI Components

### 1. Inbox Envelope + Assistant Icon (Dashboard Component)

**Layout:** Glass oval/pill component containing two icons side by side.
```
┌─────────────────────────────┐
│  📧  •   🤖                │  ← Glass pill, optional blue glow ring
└─────────────────────────────┘
```

**Envelope Icon (left):**
- Tri-state colored dot (top-right corner):
  - 🔴 Red dot = unread messages exist
  - 🟡 Yellow dot = all read but unreplied
  - 🟢 Green dot = all resolved
  - No dot = inbox empty
- **Click** → Navigate to `/dashboard/messages`
- **Hover** → Fan out into 3 sub-icons (phone, SMS, email) offset above/below
  - Click sub-icon → Navigate to `/dashboard/messages?filter=phone|sms|email`
  - Sub-icons inherit the tri-state dot for their specific channel

**Assistant Icon (right):**
- Shows current mode state:
  - No glow = OFF
  - Blue glow ring around entire pill = assistant active (any mode)
- **Click** → Toggle assistant ON/OFF (using last-used mode, defaults to QUEUE_FOR_APPROVAL)
- **Hover** → Fan out into 3 mode options:
  - ⚡ Full Auto
  - 📋 Queue for Approval
  - 🏖️ Out of Office
  - Click any → activate that mode

### 2. Messages Inbox Page (`/dashboard/messages`)

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│ Messages                              [🔍] [Filter ▾] │
│ All | 📞 Phone | 💬 SMS | 📧 Email                   │
├────────────────────┬─────────────────────────────────┤
│ Thread List        │ Thread Detail                   │
│                    │                                 │
│ 🔴 John Smith      │ John Smith                      │
│  📞 Voicemail 2m   │ +1 (203) 555-0100               │
│  "Hey, calling..." │                                 │
│                    │ 📞 Mar 20, 2:15 PM (Voicemail)  │
│ 🟡 Sarah Chen      │ "Hey, calling about the leak    │
│  💬 SMS 15m        │  in my kitchen again..."         │
│  "Thanks for..."   │  [▶ Play] [📝 Transcription]    │
│                    │                                 │
│ 🟢 Mike Davis      │ 💬 Mar 20, 2:30 PM (You)        │
│  📧 Email 1h       │ "Hi John, sorry to hear that.   │
│  "Invoice #1042"   │  I've created work order        │
│                    │  WO-1042 for you..."            │
│ 🟠 Jane Doe        │                                 │
│  🤖 Needs review   │ 📧 Mar 20, 3:00 PM (John)       │
│  "RE: Estimate"    │ "Great, what time will the      │
│                    │  tech arrive?"                   │
│                    │                                 │
│                    │ ┌─ AI Draft (pending) ─────────┐│
│                    │ │ 🤖 "Based on the schedule,   ││
│                    │ │ your technician Mike will    ││
│                    │ │ arrive between 9-11 AM..."   ││
│                    │ │ [✓ Send] [✏️ Edit] [✗ Reject]││
│                    │ └──────────────────────────────┘│
│                    │                                 │
│                    │ [💬 Reply SMS] [📧 Reply Email]  │
│                    │ [📞 Call Back]                   │
└────────────────────┴─────────────────────────────────┘
```

**Thread List (left panel):**
- Sorted by `lastMessageAt` descending
- Each row shows: read status dot, contact name, channel icon, time, preview
- 🟠 Orange highlight for threads with AI drafts awaiting approval
- Filter tabs: All, Phone, SMS, Email
- Search by contact name, phone, email, or message content

**Thread Detail (right panel):**
- Full conversation timeline with channel icons per message
- Voicemail messages: inline audio player + transcription
- AI draft section (if QUEUE_FOR_APPROVAL): approve/edit/reject controls
- Reply bar: channel selector (SMS/Email/Call) + compose

### 3. Command Center Widget

Compact card for the main dashboard:
```
┌──────────────────────────────────────┐
│ 📧 Messages                    •3 🔴 │
│                                      │
│ John Smith     📞 Voicemail    2m ago │
│ Sarah Chen     💬 SMS reply   15m ago │
│ Jane Doe       🤖 Needs review  1h   │
│                                      │
│ [View All Messages →]                │
└──────────────────────────────────────┘
```

---

## API Routes

### Thread Management
- `GET /api/messages/threads` — List threads (with pagination, filters, read status)
- `GET /api/messages/threads/[id]` — Thread detail with all messages
- `PATCH /api/messages/threads/[id]/read` — Update read status (UNREAD → READ → RESOLVED)
- `DELETE /api/messages/threads/[id]` — Archive thread

### Message Ingestion (Internal — called by existing systems)
- `POST /api/messages/ingest` — Create or append to a thread when a new call/SMS/email arrives
  - Called by: voice status webhook, SMS webhook, email webhook
  - Resolves contact → finds or creates thread → creates ThreadMessage → triggers assistant if active

### Assistant / Drafts
- `GET /api/messages/drafts` — List pending drafts for an employee
- `PATCH /api/messages/drafts/[id]` — Approve, edit, or reject a draft
- `POST /api/messages/drafts/[id]/send` — Send an approved/edited draft
- `GET /api/assistant/config` — Get assistant config for current employee
- `PUT /api/assistant/config` — Update assistant mode and settings

### Unified Send (from inbox)
- `POST /api/messages/send` — Send a reply from the inbox (SMS or email), creates ThreadMessage

---

## Assistant Agent Architecture

### Event Flow
```
New message arrives (call/SMS/email)
  → Webhook handler creates ThreadMessage via /api/messages/ingest
  → Ingest route checks: is there an active AssistantConfig for the assigned employee?
    → OFF: do nothing, just update thread + set UNREAD
    → OUT_OF_OFFICE: immediately send OOO reply, create outbound ThreadMessage
    → FULL_AUTO:
        1. Build context: thread history, contact info, CRM data, tools available
        2. Call AI with system prompt + conversation context
        3. AI decides: respond directly OR escalate
        4. If confident (>= threshold): send response, create outbound ThreadMessage
        5. If not confident or keyword match: create DraftResponse with status=ESCALATED,
           set thread to 🟠 orange, notify employee
    → QUEUE_FOR_APPROVAL:
        1. Same as FULL_AUTO steps 1-2
        2. Always create DraftResponse with status=PENDING
        3. Set thread to 🟠 orange, notify employee
```

### AI Context for Assistant
The assistant agent receives:
- Full thread history (all messages, all channels)
- Contact info from CRM (if linked)
- Employee's custom system prompt
- Access to tools: check_schedule, lookup_customer, search_knowledge_base, create_work_order
- Organization context: business name, hours, services

### Escalation Triggers (FULL_AUTO mode)
AI auto-escalates to human when:
- Confidence score below threshold (configurable, default 0.8)
- Message contains configured keywords (e.g., "lawsuit", "refund", "manager")
- Customer expresses frustration or anger (sentiment detection)
- Question requires information the AI doesn't have access to
- Multiple failed tool calls in sequence

---

## Build Phases

### Phase 1 (This Session): Foundation + Inbox UI
**What we build now:**
- Prisma schema additions (all models + enums above)
- Thread management API routes
- Message ingest API (wired to existing SMS/email/voice webhooks)
- Messages inbox page with threaded view
- Channel filter tabs, search, read status tracking
- Thread detail view with conversation timeline
- Sidebar navigation update
- Dashboard envelope icon with tri-state dot (click to navigate)

**What we scaffold but don't fully implement:**
- AssistantConfig model (schema only)
- DraftResponse model (schema only)
- Assistant icon (visible but shows "Coming Soon" on click)

### Phase 2 (Future): Assistant Agent + Dashboard Widget
- Assistant AI engine (prompt building, tool access, confidence scoring)
- Draft approval workflow (approve/edit/reject/send)
- Full auto + queue for approval modes
- Out of office auto-reply
- Command Center mini-inbox widget
- Envelope hover-to-split interaction
- Assistant icon toggle + mode selection

### Phase 3 (Future): Advanced Features
- Reply from inbox (SMS/email compose, callback initiation)
- Voicemail inline player + auto-transcription
- Thread merging (when CRM links phone + email to same client)
- Push notifications for escalations
- Assistant performance analytics (response time, accuracy, escalation rate)
- Agent builder UI for customizing assistant prompts

---

## Navigation Updates

### Sidebar
- Add "Messages" to the **Core** nav group (between Command Center and Client Intelligence)
- Icon: `MessageSquare` (Lucide)
- Shows unread count badge

### Breadcrumb
- Add `messages` → "Messages" mapping

---

## Environment Variables
No new env vars required. Uses existing:
- `RESEND_API_KEY` (email sending)
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_SMS_NUMBER` (SMS sending)
- `OPENAI_API_KEY` (assistant agent, Phase 2 — Railway only)
