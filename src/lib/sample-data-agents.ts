// ─── AI Agent Employees — Sample Data ─────────────────────────────
// Module 16: Agent roster, personas, roles, activity, corrections, config

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export type AgentStatus = "active" | "training" | "paused" | "deactivated";
export type AgentType = "employee" | "assistant";
export type AutonomyLevel = "supervised" | "standard" | "autonomous";
export type CorrectionCategory = "knowledge-gap" | "process-error" | "tone-issue" | "escalation-failure" | "factual-error";
export type CorrectionStatus = "active" | "resolved" | "archived";
export type LearningFrequency = "light" | "standard" | "aggressive";
export type LearningDepth = "summary" | "full-context";
export type RetentionPolicy = "permanent" | "rolling-90" | "decaying-60";
export type InteractionChannel = "phone" | "email" | "chat" | "sms" | "web-form";
export type InteractionOutcome = "resolved" | "escalated" | "error" | "transferred" | "pending";
export type VoiceOption = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
export type VADMode = "semantic" | "server-vad";
export type RealtimeModel = "gpt-realtime-mini" | "gpt-realtime-1.5";

export interface AgentRole {
  id: string;
  name: string;
  department: string;
  description: string;
  capabilities: string[];
  dataAccess: string[];
  defaultTools: string[];
}

export interface AgentPersona {
  id: string;
  name: string;
  greeting: string;
  personality: string;
  voice: VoiceOption;
  communicationStyle: string;
}

export interface ContextLayer {
  layer: number;
  name: string;
  type: "static" | "template" | "dynamic" | "persona" | "runtime";
  tokenEstimate: number;
  source: string;
  description: string;
  editable: boolean;
}

export interface AgentModelConfig {
  model: RealtimeModel;
  temperature: number;
  maxTokens: number;
  voice: VoiceOption;
  vadMode: VADMode;
}

export interface AgentLearningConfig {
  frequency: LearningFrequency;
  depth: LearningDepth;
  retentionPolicy: RetentionPolicy;
  autoCorrectTriggers: {
    customerFrustration: boolean;
    escalationAfterFailure: boolean;
    toolCallFailure: boolean;
    longSilence: boolean;
    repeatedQuestion: boolean;
    contradictoryStatements: boolean;
  };
}

export interface AgentMetrics {
  tasksCompleted: number;
  avgResponseTime: number; // seconds
  accuracyRate: number; // 0-100
  escalationRate: number; // 0-100
  satisfactionScore: number; // 0-5
  resolutionRate: number; // 0-100
  totalCalls: number;
  totalEmails: number;
  totalChats: number;
}

export interface AgentCorrection {
  id: string;
  agentId: string;
  date: string;
  category: CorrectionCategory;
  status: CorrectionStatus;
  trigger: string;
  description: string;
  originalResponse: string;
  correctedGuidance: string;
  interactionId: string;
}

export interface AgentInteraction {
  id: string;
  agentId: string;
  timestamp: string;
  channel: InteractionChannel;
  outcome: InteractionOutcome;
  summary: string;
  customerName: string;
  duration: number; // seconds
  toolCalls: number;
  responseTime: number; // avg seconds
  sentiment: number; // -1 to 1
  hasCorrection: boolean;
  correctionId?: string;
}

export interface AgentEmployee {
  id: string;
  name: string;
  type: AgentType;
  roleId: string;
  personaId: string;
  status: AgentStatus;
  department: string;
  autonomyLevel: AutonomyLevel;
  workingHours: string;
  hireDate: string;
  channels: InteractionChannel[];
  modelConfig: AgentModelConfig;
  learningConfig: AgentLearningConfig;
  metrics: AgentMetrics;
  permissions: Record<string, { read: boolean; write: boolean }>;
  contextLayers: ContextLayer[];
  corrections: AgentCorrection[];
  interactions: AgentInteraction[];
  learnedBehaviors: string[];
}


// ═══════════════════════════════════════════════════════════════════
// SAMPLE ROLES
// ═══════════════════════════════════════════════════════════════════

export const agentRoles: AgentRole[] = [
  {
    id: "role-receptionist",
    name: "Receptionist",
    department: "Front Office",
    description: "Answer calls, route inquiries, create work orders from calls, schedule appointments",
    capabilities: ["Answer phone calls", "Handle email inquiries", "Schedule appointments", "Create work orders", "Look up customer info", "Transfer calls"],
    dataAccess: ["Clients", "Scheduling", "Work Orders", "AI Receptionist"],
    defaultTools: ["check_calendar", "book_appointment", "lookup_customer", "lookup_knowledge", "create_work_order", "update_event_notes", "transfer_call"],
  },
  {
    id: "role-dispatcher",
    name: "Dispatcher",
    department: "Operations",
    description: "Assign technicians to jobs, optimize routes, handle schedule conflicts, manage emergencies",
    capabilities: ["Assign technicians", "Route optimization", "Conflict resolution", "Emergency dispatch", "Schedule management"],
    dataAccess: ["Scheduling", "Work Orders", "Workforce", "Fleet", "Geo"],
    defaultTools: ["check_calendar", "assign_technician", "optimize_route", "lookup_customer", "update_work_order"],
  },
  {
    id: "role-inside-sales",
    name: "Inside Sales",
    department: "Sales",
    description: "Follow up on leads, qualify prospects, send estimates, nurture pipeline",
    capabilities: ["Lead follow-up", "Prospect qualification", "Estimate creation", "Pipeline management", "Outbound calls"],
    dataAccess: ["Sales & Marketing", "Clients", "Estimates"],
    defaultTools: ["lookup_customer", "create_estimate", "send_email", "check_calendar", "update_lead"],
  },
  {
    id: "role-customer-service",
    name: "Customer Service",
    department: "Support",
    description: "Handle client inquiries, process complaints, schedule follow-ups, send updates",
    capabilities: ["Client inquiries", "Complaint handling", "Follow-up scheduling", "Status updates", "Satisfaction surveys"],
    dataAccess: ["Clients", "Work Orders", "Invoicing", "Scheduling"],
    defaultTools: ["lookup_customer", "check_calendar", "lookup_knowledge", "send_notification", "update_work_order"],
  },
  {
    id: "role-financial-analyst",
    name: "Financial Analyst",
    department: "Finance",
    description: "Generate reports, flag anomalies, forecast cash flow, prepare tax summaries",
    capabilities: ["Report generation", "Anomaly detection", "Cash flow forecasting", "Tax preparation", "Budget analysis"],
    dataAccess: ["Financial", "Invoicing", "Inventory", "Workforce"],
    defaultTools: ["generate_report", "query_financials", "create_forecast", "flag_anomaly"],
  },
];

// ═══════════════════════════════════════════════════════════════════
// SAMPLE PERSONAS
// ═══════════════════════════════════════════════════════════════════

export const agentPersonas: AgentPersona[] = [
  {
    id: "persona-alex",
    name: "Alex",
    greeting: "Thank you for calling TripleA Plumbing, this is Alex. How can I help you today?",
    personality: "Professional but warm — like a friendly office manager who genuinely cares. Confident but honest — never guesses. Efficient — respects the caller's time. Empathetic — acknowledges frustration.",
    voice: "alloy",
    communicationStyle: "Clear, concise, and friendly. Uses the customer's name when known. Confirms details by repeating them back.",
  },
  {
    id: "persona-jordan",
    name: "Jordan",
    greeting: "TripleA Plumbing dispatch, this is Jordan. What do we have?",
    personality: "Efficient and direct. Operations-minded — thinks in logistics. Calm under pressure. Quick decision-maker.",
    voice: "onyx",
    communicationStyle: "Brief and precise. Focuses on actionable details. Uses short confirmations.",
  },
  {
    id: "persona-riley",
    name: "Riley",
    greeting: "Hi there! This is Riley from TripleA Plumbing. Thanks for reaching out!",
    personality: "Enthusiastic and personable. Builds rapport quickly. Persistent but not pushy. Great at reading customer intent.",
    voice: "nova",
    communicationStyle: "Conversational and warm. Asks open-ended questions. Mirrors the customer's energy level.",
  },
  {
    id: "persona-morgan",
    name: "Morgan",
    greeting: "Thank you for contacting TripleA Plumbing support. This is Morgan. I'm here to help.",
    personality: "Patient and thorough. Never rushes. Excellent listener. Empathetic without being overly emotional. Solutions-focused.",
    voice: "shimmer",
    communicationStyle: "Calm and reassuring. Validates concerns before offering solutions. Provides clear next steps.",
  },
];

// ═══════════════════════════════════════════════════════════════════
// DEFAULT CONTEXT LAYERS
// ═══════════════════════════════════════════════════════════════════

export const defaultContextLayers: ContextLayer[] = [
  {
    layer: 1,
    name: "Platform",
    type: "static",
    tokenEstimate: 200,
    source: "system/platform-prompt.md",
    description: "Core A1NT capabilities, data access patterns, output formats, tool usage instructions",
    editable: false,
  },
  {
    layer: 2,
    name: "Industry",
    type: "template",
    tokenEstimate: 150,
    source: "templates/plumbing-hvac.md",
    description: "Template-specific knowledge — plumbing terminology, HVAC codes, industry standards",
    editable: true,
  },
  {
    layer: 3,
    name: "Company",
    type: "dynamic",
    tokenEstimate: 180,
    source: "org/company-profile",
    description: "Business name, location, team size, services offered, policies, pricing ranges",
    editable: true,
  },
  {
    layer: 4,
    name: "Role",
    type: "persona",
    tokenEstimate: 350,
    source: "agents/{agentId}/role-prompt.md",
    description: "Role-specific instructions, SOPs, escalation rules, tone guidelines, job responsibilities",
    editable: true,
  },
  {
    layer: 5,
    name: "Personality",
    type: "persona",
    tokenEstimate: 120,
    source: "agents/{agentId}/persona.md",
    description: "Name, communication style, greeting, formality level, voice characteristics",
    editable: true,
  },
  {
    layer: 6,
    name: "Live Context",
    type: "runtime",
    tokenEstimate: 0,
    source: "runtime/session",
    description: "Real-time data: caller info, open work orders, schedule state, current time",
    editable: false,
  },
];

// ═══════════════════════════════════════════════════════════════════
// SAMPLE AGENTS
// ═══════════════════════════════════════════════════════════════════

const alexCorrections: AgentCorrection[] = [
  {
    id: "corr-001",
    agentId: "agent-alex",
    date: "2026-03-15T14:30:00Z",
    category: "knowledge-gap",
    status: "active",
    trigger: "Escalation after failed resolution",
    description: "Booked a bathroom remodel estimate for 30 min — should have been 60 min for full remodels",
    originalResponse: "I have you down for a 30-minute estimate appointment on Thursday at 10am.",
    correctedGuidance: "Always ask scope first. Simple fixture swap = 30 min. Full remodel = 60 min. Ask: 'Are you looking at replacing a specific fixture, or is this a full bathroom renovation?'",
    interactionId: "int-012",
  },
  {
    id: "corr-002",
    agentId: "agent-alex",
    date: "2026-03-17T10:15:00Z",
    category: "factual-error",
    status: "active",
    trigger: "Supervisor manual flag",
    description: "Gave pricing for tankless water heater install without mentioning gas line requirements",
    originalResponse: "A tankless water heater installation typically runs between $2,500 and $4,000.",
    correctedGuidance: "Always mention that tankless may require a gas line upgrade, which is a separate cost. Say: 'Tankless installation is typically $2,500-$4,000, but depending on your current gas line setup, there may be additional plumbing for the gas line upgrade.'",
    interactionId: "int-019",
  },
  {
    id: "corr-003",
    agentId: "agent-alex",
    date: "2026-03-18T16:45:00Z",
    category: "tone-issue",
    status: "resolved",
    trigger: "Customer frustration detected",
    description: "Responded too formally to a distressed customer with a burst pipe emergency",
    originalResponse: "I understand. Let me check our schedule for available appointment times.",
    correctedGuidance: "For emergencies (burst pipe, flooding, gas leak), skip scheduling language. Lead with reassurance: 'I understand this is urgent — let me get our emergency team on this right away. Can you tell me your address so we can dispatch someone immediately?'",
    interactionId: "int-023",
  },
];

const alexInteractions: AgentInteraction[] = [
  {
    id: "int-030",
    agentId: "agent-alex",
    timestamp: "2026-03-19T09:15:00Z",
    channel: "phone",
    outcome: "resolved",
    summary: "Customer called to schedule a faucet repair estimate. Booked for Thursday 2pm.",
    customerName: "Sarah Mitchell",
    duration: 185,
    toolCalls: 3,
    responseTime: 0.8,
    sentiment: 0.7,
    hasCorrection: false,
  },
  {
    id: "int-029",
    agentId: "agent-alex",
    timestamp: "2026-03-19T08:42:00Z",
    channel: "phone",
    outcome: "transferred",
    summary: "Customer asked detailed technical questions about sump pump installation. Transferred to estimator.",
    customerName: "Robert Kim",
    duration: 240,
    toolCalls: 2,
    responseTime: 1.1,
    sentiment: 0.3,
    hasCorrection: false,
  },
  {
    id: "int-028",
    agentId: "agent-alex",
    timestamp: "2026-03-18T16:45:00Z",
    channel: "phone",
    outcome: "resolved",
    summary: "Emergency call — burst pipe. Dispatched emergency team immediately. Customer calmed and grateful.",
    customerName: "Linda Torres",
    duration: 310,
    toolCalls: 4,
    responseTime: 0.6,
    sentiment: 0.8,
    hasCorrection: true,
    correctionId: "corr-003",
  },
  {
    id: "int-027",
    agentId: "agent-alex",
    timestamp: "2026-03-18T14:20:00Z",
    channel: "email",
    outcome: "resolved",
    summary: "Customer emailed asking about water heater replacement options. Replied with service info and scheduling link.",
    customerName: "James Walsh",
    duration: 0,
    toolCalls: 2,
    responseTime: 12.0,
    sentiment: 0.5,
    hasCorrection: false,
  },
  {
    id: "int-026",
    agentId: "agent-alex",
    timestamp: "2026-03-18T11:05:00Z",
    channel: "phone",
    outcome: "resolved",
    summary: "Returning customer checking on scheduled bathroom remodel date. Confirmed March 25th.",
    customerName: "Patricia Chen",
    duration: 95,
    toolCalls: 2,
    responseTime: 0.7,
    sentiment: 0.9,
    hasCorrection: false,
  },
  {
    id: "int-025",
    agentId: "agent-alex",
    timestamp: "2026-03-18T09:30:00Z",
    channel: "phone",
    outcome: "escalated",
    summary: "Customer complained about invoice discrepancy. Escalated to office manager.",
    customerName: "David Park",
    duration: 420,
    toolCalls: 3,
    responseTime: 1.3,
    sentiment: -0.4,
    hasCorrection: false,
  },
  {
    id: "int-024",
    agentId: "agent-alex",
    timestamp: "2026-03-17T15:10:00Z",
    channel: "chat",
    outcome: "resolved",
    summary: "Website chat inquiry about drain cleaning pricing. Provided range and scheduled estimate.",
    customerName: "Amy Rodriguez",
    duration: 340,
    toolCalls: 3,
    responseTime: 2.1,
    sentiment: 0.6,
    hasCorrection: false,
  },
];

export const sampleAgents: AgentEmployee[] = [
  {
    id: "agent-alex",
    name: "Alex",
    type: "employee",
    roleId: "role-receptionist",
    personaId: "persona-alex",
    status: "active",
    department: "Front Office",
    autonomyLevel: "standard",
    workingHours: "24/7",
    hireDate: "2026-03-01",
    channels: ["phone", "email", "chat", "sms"],
    modelConfig: {
      model: "gpt-realtime-mini",
      temperature: 0.7,
      maxTokens: 4096,
      voice: "alloy",
      vadMode: "semantic",
    },
    learningConfig: {
      frequency: "standard",
      depth: "full-context",
      retentionPolicy: "rolling-90",
      autoCorrectTriggers: {
        customerFrustration: true,
        escalationAfterFailure: true,
        toolCallFailure: true,
        longSilence: true,
        repeatedQuestion: true,
        contradictoryStatements: true,
      },
    },
    metrics: {
      tasksCompleted: 847,
      avgResponseTime: 0.8,
      accuracyRate: 96.2,
      escalationRate: 8.4,
      satisfactionScore: 4.7,
      resolutionRate: 91.8,
      totalCalls: 612,
      totalEmails: 134,
      totalChats: 101,
    },
    permissions: {
      clients: { read: true, write: true },
      scheduling: { read: true, write: true },
      "work-orders": { read: true, write: true },
      "knowledge-base": { read: true, write: false },
      invoicing: { read: true, write: false },
      financial: { read: false, write: false },
      inventory: { read: false, write: false },
      workforce: { read: false, write: false },
    },
    contextLayers: defaultContextLayers,
    corrections: alexCorrections,
    interactions: alexInteractions,
    learnedBehaviors: [
      "Mrs. Johnson always requests Mike for HVAC work (learned 2026-03-08)",
      "Customers calling about water heater issues often also need expansion tank check (learned 2026-03-12)",
      "Tuesday mornings are busiest for estimate requests (learned 2026-03-15)",
      "When customers mention 'bathroom remodel' — always confirm scope before booking (learned from correction 2026-03-15)",
      "Emergency calls should skip scheduling language — lead with reassurance (learned from correction 2026-03-18)",
    ],
  },
  {
    id: "agent-jordan",
    name: "Jordan",
    type: "employee",
    roleId: "role-dispatcher",
    personaId: "persona-jordan",
    status: "active",
    department: "Operations",
    autonomyLevel: "standard",
    workingHours: "Mon-Fri 6am-6pm",
    hireDate: "2026-03-05",
    channels: ["chat", "sms"],
    modelConfig: {
      model: "gpt-realtime-mini",
      temperature: 0.5,
      maxTokens: 4096,
      voice: "onyx",
      vadMode: "server-vad",
    },
    learningConfig: {
      frequency: "standard",
      depth: "summary",
      retentionPolicy: "rolling-90",
      autoCorrectTriggers: {
        customerFrustration: false,
        escalationAfterFailure: true,
        toolCallFailure: true,
        longSilence: false,
        repeatedQuestion: true,
        contradictoryStatements: true,
      },
    },
    metrics: {
      tasksCompleted: 423,
      avgResponseTime: 0.5,
      accuracyRate: 98.1,
      escalationRate: 3.2,
      satisfactionScore: 4.8,
      resolutionRate: 96.7,
      totalCalls: 0,
      totalEmails: 0,
      totalChats: 423,
    },
    permissions: {
      clients: { read: true, write: false },
      scheduling: { read: true, write: true },
      "work-orders": { read: true, write: true },
      "knowledge-base": { read: true, write: false },
      invoicing: { read: false, write: false },
      financial: { read: false, write: false },
      inventory: { read: true, write: false },
      workforce: { read: true, write: true },
    },
    contextLayers: defaultContextLayers,
    corrections: [],
    interactions: [],
    learnedBehaviors: [
      "Mike specializes in residential HVAC; Tom handles commercial (learned 2026-03-06)",
      "Route optimization should factor in tool truck inventory — not just proximity (learned 2026-03-10)",
    ],
  },
  {
    id: "agent-riley",
    name: "Riley",
    type: "employee",
    roleId: "role-inside-sales",
    personaId: "persona-riley",
    status: "training",
    department: "Sales",
    autonomyLevel: "supervised",
    workingHours: "Mon-Fri 8am-5pm",
    hireDate: "2026-03-18",
    channels: ["phone", "email"],
    modelConfig: {
      model: "gpt-realtime-mini",
      temperature: 0.8,
      maxTokens: 4096,
      voice: "nova",
      vadMode: "semantic",
    },
    learningConfig: {
      frequency: "aggressive",
      depth: "full-context",
      retentionPolicy: "permanent",
      autoCorrectTriggers: {
        customerFrustration: true,
        escalationAfterFailure: true,
        toolCallFailure: true,
        longSilence: true,
        repeatedQuestion: true,
        contradictoryStatements: true,
      },
    },
    metrics: {
      tasksCompleted: 12,
      avgResponseTime: 1.2,
      accuracyRate: 87.5,
      escalationRate: 25.0,
      satisfactionScore: 4.1,
      resolutionRate: 75.0,
      totalCalls: 8,
      totalEmails: 4,
      totalChats: 0,
    },
    permissions: {
      clients: { read: true, write: true },
      scheduling: { read: true, write: true },
      "work-orders": { read: true, write: false },
      "knowledge-base": { read: true, write: false },
      invoicing: { read: true, write: false },
      financial: { read: false, write: false },
      inventory: { read: false, write: false },
      workforce: { read: false, write: false },
    },
    contextLayers: defaultContextLayers,
    corrections: [],
    interactions: [],
    learnedBehaviors: [],
  },
];
