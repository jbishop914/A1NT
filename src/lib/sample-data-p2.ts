// =============================================================================
// Sample data for P2 modules — Employee & Workforce, Inventory & Parts, AI Receptionist
// Used for UI development before database is connected
// =============================================================================

// ─── EMPLOYEE & WORKFORCE ────────────────────────────────────────

export interface Employee {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: "Active" | "On Leave" | "Inactive";
  hireDate: string;
  skills: string[];
  certifications: Certification[];
  hourlyRate: number;
  hoursThisWeek: number;
  hoursThisMonth: number;
  jobsCompleted: number;
  avgRating: number;
  avatar?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  issued: string;
  expires: string;
  status: "Valid" | "Expiring" | "Expired";
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  totalHours: number;
  workOrderId: string | null;
  workOrderTitle: string | null;
  type: "Regular" | "Overtime" | "PTO" | "Sick";
  status: "Clocked In" | "Completed" | "Approved" | "Pending";
}

export const employeesP2: Employee[] = [
  {
    id: "emp-1",
    name: "Mike Rodriguez",
    initials: "MR",
    email: "mike.r@oldbishopfarm.com",
    phone: "(203) 555-0101",
    role: "Senior Technician",
    department: "Field Operations",
    status: "Active",
    hireDate: "2021-03-15",
    skills: ["HVAC", "Plumbing", "Residential", "Commercial"],
    certifications: [
      { name: "EPA 608 Universal", issuer: "EPA", issued: "2022-06-01", expires: "2027-06-01", status: "Valid" },
      { name: "OSHA 30-Hour", issuer: "OSHA", issued: "2023-01-15", expires: "2028-01-15", status: "Valid" },
      { name: "CT P-1 Plumbing License", issuer: "CT DCP", issued: "2021-09-01", expires: "2026-09-01", status: "Valid" },
    ],
    hourlyRate: 42,
    hoursThisWeek: 38,
    hoursThisMonth: 164,
    jobsCompleted: 847,
    avgRating: 4.9,
  },
  {
    id: "emp-2",
    name: "Dave Sullivan",
    initials: "DS",
    email: "dave.s@oldbishopfarm.com",
    phone: "(203) 555-0102",
    role: "Technician",
    department: "Field Operations",
    status: "Active",
    hireDate: "2022-07-01",
    skills: ["Plumbing", "Commercial", "Water Heaters"],
    certifications: [
      { name: "CT P-2 Plumbing License", issuer: "CT DCP", issued: "2022-08-01", expires: "2026-04-15", status: "Expiring" },
      { name: "OSHA 10-Hour", issuer: "OSHA", issued: "2022-07-15", expires: "2027-07-15", status: "Valid" },
    ],
    hourlyRate: 35,
    hoursThisWeek: 42,
    hoursThisMonth: 172,
    jobsCompleted: 423,
    avgRating: 4.7,
  },
  {
    id: "emp-3",
    name: "Lisa Kim",
    initials: "LK",
    email: "lisa.k@oldbishopfarm.com",
    phone: "(203) 555-0103",
    role: "Technician",
    department: "Field Operations",
    status: "Active",
    hireDate: "2023-02-20",
    skills: ["HVAC", "Electrical", "Residential"],
    certifications: [
      { name: "EPA 608 Universal", issuer: "EPA", issued: "2023-03-01", expires: "2028-03-01", status: "Valid" },
      { name: "CT E-2 Electrical License", issuer: "CT DCP", issued: "2023-04-01", expires: "2026-04-01", status: "Expiring" },
    ],
    hourlyRate: 35,
    hoursThisWeek: 36,
    hoursThisMonth: 152,
    jobsCompleted: 298,
    avgRating: 4.8,
  },
  {
    id: "emp-4",
    name: "Carlos Mendez",
    initials: "CM",
    email: "carlos.m@oldbishopfarm.com",
    phone: "(203) 555-0104",
    role: "Apprentice",
    department: "Field Operations",
    status: "Active",
    hireDate: "2025-06-01",
    skills: ["Plumbing"],
    certifications: [
      { name: "OSHA 10-Hour", issuer: "OSHA", issued: "2025-06-15", expires: "2030-06-15", status: "Valid" },
    ],
    hourlyRate: 22,
    hoursThisWeek: 40,
    hoursThisMonth: 160,
    jobsCompleted: 87,
    avgRating: 4.5,
  },
  {
    id: "emp-5",
    name: "Sarah Chen",
    initials: "SC",
    email: "sarah.c@oldbishopfarm.com",
    phone: "(203) 555-0105",
    role: "Office Manager",
    department: "Administration",
    status: "Active",
    hireDate: "2020-01-10",
    skills: ["Scheduling", "Customer Service", "Billing", "QuickBooks"],
    certifications: [],
    hourlyRate: 30,
    hoursThisWeek: 40,
    hoursThisMonth: 168,
    jobsCompleted: 0,
    avgRating: 0,
  },
  {
    id: "emp-6",
    name: "Tom Bradley",
    initials: "TB",
    email: "tom.b@oldbishopfarm.com",
    phone: "(203) 555-0106",
    role: "Technician",
    department: "Field Operations",
    status: "On Leave",
    hireDate: "2022-11-01",
    skills: ["HVAC", "Plumbing", "Residential"],
    certifications: [
      { name: "EPA 608 Type II", issuer: "EPA", issued: "2022-12-01", expires: "2027-12-01", status: "Valid" },
      { name: "First Aid/CPR", issuer: "Red Cross", issued: "2024-03-01", expires: "2026-03-01", status: "Expired" },
    ],
    hourlyRate: 35,
    hoursThisWeek: 0,
    hoursThisMonth: 40,
    jobsCompleted: 312,
    avgRating: 4.6,
  },
];

export const timeEntries: TimeEntry[] = [
  { id: "te-1", employeeId: "emp-1", employeeName: "Mike Rodriguez", date: "2026-03-18", clockIn: "7:00 AM", clockOut: "3:30 PM", totalHours: 8.5, workOrderId: "wo-5", workOrderTitle: "HVAC inspection — 12 Oak Lane", type: "Regular", status: "Completed" },
  { id: "te-2", employeeId: "emp-2", employeeName: "Dave Sullivan", date: "2026-03-18", clockIn: "7:30 AM", clockOut: null, totalHours: 9.5, workOrderId: "wo-3", workOrderTitle: "Pipe leak fix — 19 Maple Dr", type: "Regular", status: "Clocked In" },
  { id: "te-3", employeeId: "emp-3", employeeName: "Lisa Kim", date: "2026-03-18", clockIn: "8:00 AM", clockOut: "4:00 PM", totalHours: 8, workOrderId: "wo-6", workOrderTitle: "AC maintenance — 305 Cedar Ave", type: "Regular", status: "Approved" },
  { id: "te-4", employeeId: "emp-4", employeeName: "Carlos Mendez", date: "2026-03-18", clockIn: "7:00 AM", clockOut: "5:30 PM", totalHours: 10.5, workOrderId: "wo-1", workOrderTitle: "Emergency pipe burst — Oak St Apts", type: "Overtime", status: "Pending" },
  { id: "te-5", employeeId: "emp-5", employeeName: "Sarah Chen", date: "2026-03-18", clockIn: "8:30 AM", clockOut: "5:00 PM", totalHours: 8.5, workOrderId: null, workOrderTitle: null, type: "Regular", status: "Completed" },
  { id: "te-6", employeeId: "emp-1", employeeName: "Mike Rodriguez", date: "2026-03-17", clockIn: "7:00 AM", clockOut: "4:00 PM", totalHours: 9, workOrderId: "wo-4", workOrderTitle: "Water heater install — 742 Evergreen", type: "Regular", status: "Approved" },
  { id: "te-7", employeeId: "emp-2", employeeName: "Dave Sullivan", date: "2026-03-17", clockIn: "7:30 AM", clockOut: "3:30 PM", totalHours: 8, workOrderId: "wo-2", workOrderTitle: "Furnace repair — 88 Pine St", type: "Regular", status: "Approved" },
  { id: "te-8", employeeId: "emp-6", employeeName: "Tom Bradley", date: "2026-03-18", clockIn: "", clockOut: null, totalHours: 0, workOrderId: null, workOrderTitle: null, type: "PTO", status: "Approved" },
];

// ─── INVENTORY & PARTS ───────────────────────────────────────────

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock" | "On Order";

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unitCost: number;
  unitPrice: number;
  stockQty: number;
  minQty: number;
  maxQty: number;
  location: string;
  status: StockStatus;
  lastOrdered: string;
  supplier: string;
  usedThisMonth: number;
}

export interface InventoryLocation {
  id: string;
  name: string;
  type: "Warehouse" | "Truck" | "Van" | "Shop";
  itemCount: number;
  totalValue: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  status: "Draft" | "Sent" | "Confirmed" | "Received" | "Partial";
  items: number;
  total: number;
  orderDate: string;
  expectedDate: string;
}

export const inventoryLocations: InventoryLocation[] = [
  { id: "loc-1", name: "Main Warehouse", type: "Warehouse", itemCount: 142, totalValue: 28450 },
  { id: "loc-2", name: "Truck #1 — Mike R.", type: "Truck", itemCount: 34, totalValue: 3200 },
  { id: "loc-3", name: "Truck #2 — Dave S.", type: "Truck", itemCount: 28, totalValue: 2800 },
  { id: "loc-4", name: "Van #1 — Lisa K.", type: "Van", itemCount: 22, totalValue: 1950 },
  { id: "loc-5", name: "Shop / Repair Bay", type: "Shop", itemCount: 56, totalValue: 8400 },
];

export const inventoryItems: InventoryItem[] = [
  { id: "inv-1", sku: "CPR-050", name: "Copper Pipe 1/2\" (10ft)", category: "Piping", unitCost: 12.50, unitPrice: 18.75, stockQty: 48, minQty: 20, maxQty: 100, location: "Main Warehouse", status: "In Stock", lastOrdered: "Mar 1, 2026", supplier: "Ferguson Supply", usedThisMonth: 22 },
  { id: "inv-2", sku: "CPR-075", name: "Copper Pipe 3/4\" (10ft)", category: "Piping", unitCost: 18.00, unitPrice: 27.00, stockQty: 32, minQty: 15, maxQty: 80, location: "Main Warehouse", status: "In Stock", lastOrdered: "Mar 1, 2026", supplier: "Ferguson Supply", usedThisMonth: 14 },
  { id: "inv-3", sku: "PXF-050", name: "PEX Fitting 1/2\" Elbow", category: "Fittings", unitCost: 1.80, unitPrice: 3.50, stockQty: 8, minQty: 50, maxQty: 200, location: "Main Warehouse", status: "Low Stock", lastOrdered: "Feb 15, 2026", supplier: "Ferguson Supply", usedThisMonth: 86 },
  { id: "inv-4", sku: "WTR-HT40", name: "Water Heater 40gal Gas", category: "Equipment", unitCost: 580.00, unitPrice: 1200.00, stockQty: 3, minQty: 2, maxQty: 8, location: "Main Warehouse", status: "In Stock", lastOrdered: "Feb 20, 2026", supplier: "Rheem Direct", usedThisMonth: 2 },
  { id: "inv-5", sku: "FLT-FRN", name: "Furnace Air Filter 16x25x4", category: "Filters", unitCost: 8.50, unitPrice: 16.00, stockQty: 0, minQty: 25, maxQty: 100, location: "Main Warehouse", status: "Out of Stock", lastOrdered: "Mar 5, 2026", supplier: "Grainger", usedThisMonth: 34 },
  { id: "inv-6", sku: "SLD-WIRE", name: "Solder Wire 1lb Lead-Free", category: "Consumables", unitCost: 22.00, unitPrice: 35.00, stockQty: 6, minQty: 5, maxQty: 20, location: "Shop / Repair Bay", status: "Low Stock", lastOrdered: "Jan 20, 2026", supplier: "Grainger", usedThisMonth: 4 },
  { id: "inv-7", sku: "VAL-BL050", name: "Ball Valve 1/2\" Brass", category: "Valves", unitCost: 14.00, unitPrice: 24.00, stockQty: 24, minQty: 10, maxQty: 50, location: "Main Warehouse", status: "In Stock", lastOrdered: "Feb 10, 2026", supplier: "Ferguson Supply", usedThisMonth: 8 },
  { id: "inv-8", sku: "TFL-TAPE", name: "Teflon Tape (10 pack)", category: "Consumables", unitCost: 6.50, unitPrice: 12.00, stockQty: 45, minQty: 20, maxQty: 80, location: "Main Warehouse", status: "In Stock", lastOrdered: "Mar 1, 2026", supplier: "Grainger", usedThisMonth: 18 },
  { id: "inv-9", sku: "REFR-R410", name: "R-410A Refrigerant 25lb", category: "HVAC", unitCost: 145.00, unitPrice: 320.00, stockQty: 4, minQty: 3, maxQty: 12, location: "Main Warehouse", status: "In Stock", lastOrdered: "Feb 25, 2026", supplier: "Carrier Wholesale", usedThisMonth: 3 },
  { id: "inv-10", sku: "CND-MTR", name: "Condenser Fan Motor 1/4HP", category: "HVAC", unitCost: 85.00, unitPrice: 175.00, stockQty: 2, minQty: 3, maxQty: 10, location: "Main Warehouse", status: "Low Stock", lastOrdered: "Jan 30, 2026", supplier: "Carrier Wholesale", usedThisMonth: 3 },
  { id: "inv-11", sku: "DRN-AUGER", name: "Drain Auger 50ft", category: "Tools", unitCost: 120.00, unitPrice: 0, stockQty: 3, minQty: 2, maxQty: 5, location: "Shop / Repair Bay", status: "In Stock", lastOrdered: "Dec 10, 2025", supplier: "Ridgid Tools", usedThisMonth: 0 },
  { id: "inv-12", sku: "FLX-CONN", name: "Flex Connector 3/4\" SS", category: "Fittings", unitCost: 9.50, unitPrice: 18.00, stockQty: 15, minQty: 10, maxQty: 40, location: "Main Warehouse", status: "In Stock", lastOrdered: "Mar 1, 2026", supplier: "Ferguson Supply", usedThisMonth: 6 },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: "po-1", poNumber: "PO-0045", supplier: "Ferguson Supply", status: "Confirmed", items: 4, total: 892.00, orderDate: "Mar 15, 2026", expectedDate: "Mar 20, 2026" },
  { id: "po-2", poNumber: "PO-0046", supplier: "Grainger", status: "Sent", items: 3, total: 467.50, orderDate: "Mar 16, 2026", expectedDate: "Mar 22, 2026" },
  { id: "po-3", poNumber: "PO-0047", supplier: "Carrier Wholesale", status: "Draft", items: 2, total: 640.00, orderDate: "Mar 18, 2026", expectedDate: "—" },
  { id: "po-4", poNumber: "PO-0044", supplier: "Rheem Direct", status: "Received", items: 1, total: 580.00, orderDate: "Mar 8, 2026", expectedDate: "Mar 14, 2026" },
  { id: "po-5", poNumber: "PO-0043", supplier: "Ferguson Supply", status: "Partial", items: 6, total: 1245.00, orderDate: "Mar 5, 2026", expectedDate: "Mar 12, 2026" },
];

// ─── AI RECEPTIONIST & PHONE SYSTEM ─────────────────────────────

export type CallStatus = "Active" | "Completed" | "Voicemail" | "Missed" | "Transferred";
export type CallIntent = "Service Request" | "Appointment" | "Billing" | "Emergency" | "General" | "Sales Inquiry";
export type CallPriority = "Low" | "Normal" | "High" | "Urgent";

export interface CallRecord {
  id: string;
  callerName: string;
  callerPhone: string;
  direction: "Inbound" | "Outbound";
  status: CallStatus;
  intent: CallIntent;
  priority: CallPriority;
  duration: string;
  startTime: string;
  date: string;
  summary: string;
  transcript: string;
  actionsTaken: string[];
  assignedTo: string | null;
  workOrderCreated: string | null;
  appointmentBooked: boolean;
  isNewLead: boolean;
  sentiment: "Positive" | "Neutral" | "Frustrated";
}

export interface PhoneStats {
  totalCallsToday: number;
  avgWaitTime: string;
  avgCallDuration: string;
  missedCallRate: number;
  aiHandledRate: number;
  leadsCapture: number;
  workOrdersCreated: number;
  appointmentsBooked: number;
}

export interface CallRouting {
  id: string;
  intent: CallIntent;
  route: string;
  afterHours: string;
  priority: CallPriority;
  enabled: boolean;
}

export const phoneStats: PhoneStats = {
  totalCallsToday: 23,
  avgWaitTime: "0:08",
  avgCallDuration: "3:42",
  missedCallRate: 4.3,
  aiHandledRate: 78,
  leadsCapture: 4,
  workOrdersCreated: 6,
  appointmentsBooked: 3,
};

export const callRecords: CallRecord[] = [
  {
    id: "call-1",
    callerName: "Maria Santos",
    callerPhone: "(203) 555-8901",
    direction: "Inbound",
    status: "Active",
    intent: "Emergency",
    priority: "Urgent",
    duration: "2:14",
    startTime: "5:08 PM",
    date: "Mar 18, 2026",
    summary: "Caller reports water flooding from burst pipe in kitchen ceiling. Tenant in unit 3B. Water actively running.",
    transcript: "AI: Thank you for calling Old Bishop Farm, how can I help you?\nCaller: Hi, we have water pouring through our kitchen ceiling! It's coming from the apartment above us.\nAI: I understand this is an emergency. I'm flagging this as urgent and dispatching a technician right away. Can I get your address?\nCaller: 120 Oak Ave, unit 3B.\nAI: I see you're at Oak Street Apartments. I'm creating an emergency work order now. A technician will be on their way shortly. Stay safe and turn off the water main if you can access it.",
    actionsTaken: ["Emergency work order created", "Dispatched nearest technician", "Client notified via SMS"],
    assignedTo: "Dave Sullivan",
    workOrderCreated: "WO-1091",
    appointmentBooked: false,
    isNewLead: false,
    sentiment: "Frustrated",
  },
  {
    id: "call-2",
    callerName: "Robert Chen",
    callerPhone: "(203) 555-3344",
    direction: "Inbound",
    status: "Completed",
    intent: "Appointment",
    priority: "Normal",
    duration: "1:48",
    startTime: "4:32 PM",
    date: "Mar 18, 2026",
    summary: "Requesting annual HVAC maintenance appointment. Available mornings next week.",
    transcript: "AI: Thank you for calling Old Bishop Farm. How can I help?\nCaller: Hi, I'd like to schedule my annual AC tune-up.\nAI: Of course! I can get that set up. I have availability Monday or Wednesday morning next week. Which works better for you?\nCaller: Wednesday is perfect.\nAI: Great, I've booked you for Wednesday March 25th at 9:00 AM. You'll get a confirmation text shortly.",
    actionsTaken: ["Appointment booked — Wed Mar 25, 9:00 AM", "Confirmation SMS sent"],
    assignedTo: "Lisa Kim",
    workOrderCreated: null,
    appointmentBooked: true,
    isNewLead: false,
    sentiment: "Positive",
  },
  {
    id: "call-3",
    callerName: "Jennifer Walsh",
    callerPhone: "(475) 555-7721",
    direction: "Inbound",
    status: "Completed",
    intent: "Sales Inquiry",
    priority: "Normal",
    duration: "3:22",
    startTime: "3:15 PM",
    date: "Mar 18, 2026",
    summary: "New prospect — commercial property manager with 12-unit building. Interested in maintenance plan for HVAC and plumbing. Wants a quote.",
    transcript: "AI: Thank you for calling Old Bishop Farm. How can I help you today?\nCaller: Hi, I manage a 12-unit apartment building on Maple Street and I'm looking for a new HVAC and plumbing company.\nAI: Welcome! We'd love to help. We offer commercial maintenance plans that cover both HVAC and plumbing. Can I get some details about your building so we can put together a quote?\nCaller: Sure. It's a 1985 build, central air, gas heat, about 15,000 square feet total...\nAI: Perfect. I've captured all the details and one of our team will reach out within 24 hours with a custom quote. Can I get your email?\nCaller: jwalshmgmt@email.com\nAI: Got it. You'll hear from us tomorrow. Thanks for calling!",
    actionsTaken: ["New lead created — Jennifer Walsh", "Quote request logged", "Assigned to sales queue"],
    assignedTo: null,
    workOrderCreated: null,
    appointmentBooked: false,
    isNewLead: true,
    sentiment: "Positive",
  },
  {
    id: "call-4",
    callerName: "Oak Street Apartments",
    callerPhone: "(203) 555-6789",
    direction: "Inbound",
    status: "Completed",
    intent: "Billing",
    priority: "Low",
    duration: "2:05",
    startTime: "2:00 PM",
    date: "Mar 18, 2026",
    summary: "Calling about invoice INV-2088. Payment was sent via check 3 days ago, asking for confirmation.",
    transcript: "AI: Thank you for calling Old Bishop Farm.\nCaller: Hi, this is Oak Street Apartments. I'm checking on our invoice 2088, we mailed a check last week.\nAI: Let me look that up. Yes, I see INV-2088 for $680.00. It looks like payment was received and posted today. Your balance is now zero.\nCaller: Perfect, thank you.\nAI: You're welcome! Anything else I can help with?\nCaller: Nope, that's all. Thanks!",
    actionsTaken: ["Confirmed payment status", "No action needed"],
    assignedTo: null,
    workOrderCreated: null,
    appointmentBooked: false,
    isNewLead: false,
    sentiment: "Positive",
  },
  {
    id: "call-5",
    callerName: "Unknown Caller",
    callerPhone: "(860) 555-4499",
    direction: "Inbound",
    status: "Voicemail",
    intent: "Service Request",
    priority: "Normal",
    duration: "0:45",
    startTime: "12:30 PM",
    date: "Mar 18, 2026",
    summary: "Voicemail: leaking faucet in master bathroom, been dripping for a week, requesting a callback.",
    transcript: "Voicemail transcription: Hi, this is Pat at 88 Willow Lane. I've got a leaky faucet in my master bath, it's been dripping for about a week now and it's getting worse. Can someone call me back? My number is 860-555-4499. Thanks.",
    actionsTaken: ["Voicemail transcribed", "Callback scheduled", "New lead flagged"],
    assignedTo: null,
    workOrderCreated: null,
    appointmentBooked: false,
    isNewLead: true,
    sentiment: "Neutral",
  },
  {
    id: "call-6",
    callerName: "Sunset Senior Living",
    callerPhone: "(203) 555-8901",
    direction: "Inbound",
    status: "Completed",
    intent: "Service Request",
    priority: "High",
    duration: "2:58",
    startTime: "10:15 AM",
    date: "Mar 18, 2026",
    summary: "Reporting that AC in the dining hall is blowing warm air. 40+ residents affected. Need same-day or next-day service.",
    transcript: "AI: Old Bishop Farm, how can I help?\nCaller: This is maintenance at Sunset Senior Living. Our main dining hall AC unit is blowing warm air. We have 40-plus residents eating lunch in there daily.\nAI: I understand the urgency. Let me create a high-priority work order for you. I'm checking technician availability...\nCaller: Can you get someone out today or first thing tomorrow?\nAI: Lisa Kim has availability tomorrow morning at 8 AM. I've created work order WO-1090 and scheduled the visit. She's certified for HVAC systems.\nCaller: That works. Thank you.",
    actionsTaken: ["Work order WO-1090 created", "Scheduled for tomorrow 8 AM", "Assigned to Lisa Kim"],
    assignedTo: "Lisa Kim",
    workOrderCreated: "WO-1090",
    appointmentBooked: true,
    isNewLead: false,
    sentiment: "Neutral",
  },
  {
    id: "call-7",
    callerName: "Martinez Residence",
    callerPhone: "(203) 555-7890",
    direction: "Outbound",
    status: "Completed",
    intent: "Service Request",
    priority: "Normal",
    duration: "1:15",
    startTime: "9:00 AM",
    date: "Mar 18, 2026",
    summary: "Callback to confirm appointment for garbage disposal install on Friday.",
    transcript: "AI placed an automated follow-up call to confirm the appointment.\nAI: Hi, this is Old Bishop Farm calling to confirm your appointment this Friday at 10 AM for the garbage disposal installation.\nCaller: Yes, that's correct. We'll be home.\nAI: Perfect, Mike Rodriguez will be your technician. See you Friday!",
    actionsTaken: ["Appointment confirmed"],
    assignedTo: "Mike Rodriguez",
    workOrderCreated: null,
    appointmentBooked: true,
    isNewLead: false,
    sentiment: "Positive",
  },
  {
    id: "call-8",
    callerName: "Downtown Dental Office",
    callerPhone: "(203) 555-5678",
    direction: "Inbound",
    status: "Missed",
    intent: "General",
    priority: "Normal",
    duration: "0:00",
    startTime: "8:45 AM",
    date: "Mar 18, 2026",
    summary: "Missed call — no voicemail left. Callback attempted at 9:15 AM, no answer.",
    transcript: "",
    actionsTaken: ["Callback attempted — no answer", "Follow-up scheduled for tomorrow"],
    assignedTo: null,
    workOrderCreated: null,
    appointmentBooked: false,
    isNewLead: false,
    sentiment: "Neutral",
  },
];

export const callRouting: CallRouting[] = [
  { id: "rt-1", intent: "Emergency", route: "Immediate dispatch + notify on-call tech", afterHours: "AI handles + page on-call", priority: "Urgent", enabled: true },
  { id: "rt-2", intent: "Service Request", route: "AI creates work order draft → Office review", afterHours: "AI captures details + schedules callback", priority: "Normal", enabled: true },
  { id: "rt-3", intent: "Appointment", route: "AI books directly from calendar", afterHours: "AI books directly from calendar", priority: "Normal", enabled: true },
  { id: "rt-4", intent: "Billing", route: "AI answers from invoice data → escalate if needed", afterHours: "Voicemail → flag for morning", priority: "Low", enabled: true },
  { id: "rt-5", intent: "Sales Inquiry", route: "AI captures lead info → sales queue", afterHours: "AI captures lead info → sales queue", priority: "Normal", enabled: true },
  { id: "rt-6", intent: "General", route: "AI answers FAQs → transfer to office if complex", afterHours: "Voicemail", priority: "Low", enabled: true },
];
