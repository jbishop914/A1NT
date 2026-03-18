# A1NT — A1 Integrations

AI-powered business operations platform for small and medium-sized businesses. A1 Integrations helps traditional, labor-intensive businesses adopt AI through industry-specific templates that model, optimize, and automate their operations.

## Tech Stack

- **Framework:** Next.js 16 + React + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **UI:** shadcn/ui + Tailwind CSS
- **Charts:** Recharts (via shadcn/ui charts)

## Getting Started

```bash
# Install dependencies
npm install

# Set up your database URL in .env
# DATABASE_URL="postgresql://user:password@localhost:5432/a1nt"

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/              # Next.js App Router pages & layouts
├── components/       # React components
│   └── ui/           # shadcn/ui components
├── generated/        # Prisma generated client
├── lib/              # Utilities (db client, helpers)
prisma/
├── schema.prisma     # Database schema
├── migrations/       # Database migrations
```

## Core Data Models

- **Organizations** — Client businesses using the platform
- **Templates** — Industry-specific operational blueprints (Plumbing/HVAC, Auto Repair, etc.)
- **Modules** — Toggleable AI-powered features within each template
- **Clients** — CRM contacts for each organization
- **Employees** — Workforce management
- **Tasks** — Project management & implementation tracking
- **Invoices & Payments** — Billing and financial management
- **Activity Logs** — Full audit trail

## Template System

A1NT uses a modular template architecture:

1. **Templates** define industry-specific configurations (e.g., "Plumbing & HVAC Services")
2. **Modules** are composable features that can be toggled on/off (e.g., "AI Receptionist", "Smart Dispatching")
3. **Universal Modules** (CRM, Scheduling, Invoicing, etc.) are shared across all templates
4. **Industry-Specific Modules** provide deep domain functionality

See [JOURNAL.md](JOURNAL.md) for ongoing development notes.
