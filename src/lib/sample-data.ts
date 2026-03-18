// =============================================================================
// Sample data for P1 modules — Scheduling, Work Orders, Invoicing
// Used for UI development before database is connected
// =============================================================================

// --- EMPLOYEES (technicians for assignment) ---
export const employees = [
  { id: "emp-1", name: "Mike Rodriguez", role: "Senior Technician", initials: "MR", skills: ["HVAC", "Plumbing", "Residential"] },
  { id: "emp-2", name: "Dave Sullivan", role: "Technician", initials: "DS", skills: ["Plumbing", "Commercial"] },
  { id: "emp-3", name: "Lisa Kim", role: "Technician", initials: "LK", skills: ["HVAC", "Electrical"] },
  { id: "emp-4", name: "Carlos Mendez", role: "Apprentice", initials: "CM", skills: ["Plumbing"] },
] as const;

// --- WORK ORDERS ---
export type WorkOrderStatus = "New" | "Assigned" | "In Progress" | "On Hold" | "Completed" | "Invoiced" | "Cancelled";
export type WorkOrderPriority = "Low" | "Normal" | "High" | "Emergency";

export interface WorkOrder {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  serviceType: string;
  clientName: string;
  clientId: string;
  serviceAddress: string;
  assignee: string | null;
  assigneeId: string | null;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  estimatedHours: number;
  actualHours: number | null;
  totalCost: number | null;
  notes: string;
  createdAt: string;
}

export const workOrders: WorkOrder[] = [
  {
    id: "wo-1",
    orderNumber: "WO-1080",
    title: "Emergency pipe burst repair",
    description: "Client reports burst pipe in basement utility room. Water actively flowing. Need immediate dispatch.",
    status: "Completed",
    priority: "Emergency",
    serviceType: "Plumbing Repair",
    clientName: "Oak Street Apartments",
    clientId: "2",
    serviceAddress: "88 Oak Street, Springfield, IL",
    assignee: "Mike Rodriguez",
    assigneeId: "emp-1",
    scheduledStart: "2026-03-16T08:00:00",
    scheduledEnd: "2026-03-16T11:00:00",
    estimatedHours: 3,
    actualHours: 2.5,
    totalCost: 680,
    notes: "Burst pipe in basement utility room. Replaced 4ft section of copper pipe. Tested all joints, no further leaks.",
    createdAt: "2026-03-15T16:30:00",
  },
  {
    id: "wo-2",
    orderNumber: "WO-1081",
    title: "HVAC spring maintenance — Building A",
    description: "Seasonal HVAC inspection and filter replacement for commercial building. 6 units.",
    status: "Invoiced",
    priority: "Normal",
    serviceType: "HVAC Maintenance",
    clientName: "Riverside Property Management",
    clientId: "1",
    serviceAddress: "300 River Dr, Springfield, IL",
    assignee: "Lisa Kim",
    assigneeId: "emp-3",
    scheduledStart: "2026-03-15T09:00:00",
    scheduledEnd: "2026-03-15T14:00:00",
    estimatedHours: 5,
    actualHours: 4.5,
    totalCost: 1240,
    notes: "All 6 units inspected. Replaced filters on all units. Unit #4 compressor showing early wear — recommended replacement within 6 months.",
    createdAt: "2026-03-10T09:00:00",
  },
  {
    id: "wo-3",
    orderNumber: "WO-1082",
    title: "Water heater replacement",
    description: "50-gallon gas water heater replacement. Old unit is 12 years old, leaking from base.",
    status: "Completed",
    priority: "High",
    serviceType: "Plumbing Install",
    clientName: "Martinez Residence",
    clientId: "3",
    serviceAddress: "145 Elm Street, Shelbyville, IL",
    assignee: "Dave Sullivan",
    assigneeId: "emp-2",
    scheduledStart: "2026-03-17T10:00:00",
    scheduledEnd: "2026-03-17T14:00:00",
    estimatedHours: 4,
    actualHours: 3.5,
    totalCost: 2180,
    notes: "Removed old 50-gal Rheem, installed new Bradford White 50-gal. Tested T&P valve, verified gas connection.",
    createdAt: "2026-03-14T11:00:00",
  },
  {
    id: "wo-4",
    orderNumber: "WO-1083",
    title: "Thermostat upgrade — smart thermostats",
    description: "Replace 3 old programmable thermostats with Ecobee smart thermostats. Includes setup and WiFi configuration.",
    status: "In Progress",
    priority: "Normal",
    serviceType: "HVAC Install",
    clientName: "Downtown Dental Office",
    clientId: "4",
    serviceAddress: "22 Main St, Suite 200, Springfield, IL",
    assignee: "Lisa Kim",
    assigneeId: "emp-3",
    scheduledStart: "2026-03-18T09:00:00",
    scheduledEnd: "2026-03-18T12:00:00",
    estimatedHours: 3,
    actualHours: null,
    totalCost: null,
    notes: "",
    createdAt: "2026-03-15T14:00:00",
  },
  {
    id: "wo-5",
    orderNumber: "WO-1084",
    title: "Water heater install",
    description: "New tankless water heater installation. Client upgrading from 40-gal tank unit.",
    status: "Completed",
    priority: "Normal",
    serviceType: "Plumbing Install",
    clientName: "Sunset Senior Living",
    clientId: "7",
    serviceAddress: "742 Evergreen Terrace, Springfield, IL",
    assignee: "Mike Rodriguez",
    assigneeId: "emp-1",
    scheduledStart: "2026-03-18T11:00:00",
    scheduledEnd: "2026-03-18T15:00:00",
    estimatedHours: 4,
    actualHours: 3,
    totalCost: 3200,
    notes: "Installed Rinnai RU199iN tankless unit. Ran new gas line, vented through exterior wall. All tested and operational.",
    createdAt: "2026-03-12T10:00:00",
  },
  {
    id: "wo-6",
    orderNumber: "WO-1085",
    title: "AC maintenance — annual inspection",
    description: "Annual AC system inspection and service. Check refrigerant levels, clean coils, test all components.",
    status: "Assigned",
    priority: "Normal",
    serviceType: "HVAC Maintenance",
    clientName: "Harbor View Restaurant",
    clientId: "6",
    serviceAddress: "550 Harbor Blvd, Capital City, IL",
    assignee: "Mike Rodriguez",
    assigneeId: "emp-1",
    scheduledStart: "2026-03-19T08:00:00",
    scheduledEnd: "2026-03-19T11:00:00",
    estimatedHours: 3,
    actualHours: null,
    totalCost: null,
    notes: "",
    createdAt: "2026-03-16T09:00:00",
  },
  {
    id: "wo-7",
    orderNumber: "WO-1086",
    title: "Sprinkler system repair — Zone 3",
    description: "Sprinkler zone 3 not activating. Possible solenoid valve failure or wiring issue.",
    status: "New",
    priority: "Normal",
    serviceType: "Plumbing Repair",
    clientName: "Sunset Senior Living",
    clientId: "7",
    serviceAddress: "742 Evergreen Terrace, Springfield, IL",
    assignee: null,
    assigneeId: null,
    scheduledStart: null,
    scheduledEnd: null,
    estimatedHours: 2,
    actualHours: null,
    totalCost: null,
    notes: "",
    createdAt: "2026-03-18T07:30:00",
  },
  {
    id: "wo-8",
    orderNumber: "WO-1087",
    title: "Bathroom faucet replacement",
    description: "Replace bathroom faucet and repair drain assembly. Client wants brushed nickel finish.",
    status: "New",
    priority: "Low",
    serviceType: "Plumbing Repair",
    clientName: "Martinez Residence",
    clientId: "3",
    serviceAddress: "145 Elm Street, Shelbyville, IL",
    assignee: null,
    assigneeId: null,
    scheduledStart: null,
    scheduledEnd: null,
    estimatedHours: 1.5,
    actualHours: null,
    totalCost: null,
    notes: "",
    createdAt: "2026-03-18T08:00:00",
  },
  {
    id: "wo-9",
    orderNumber: "WO-1088",
    title: "Boiler inspection — annual",
    description: "Annual boiler inspection and safety check. Test all safety controls, check heat exchanger.",
    status: "Assigned",
    priority: "Normal",
    serviceType: "HVAC Maintenance",
    clientName: "Sunset Senior Living",
    clientId: "7",
    serviceAddress: "742 Evergreen Terrace, Springfield, IL",
    assignee: "Dave Sullivan",
    assigneeId: "emp-2",
    scheduledStart: "2026-03-19T13:00:00",
    scheduledEnd: "2026-03-19T16:00:00",
    estimatedHours: 3,
    actualHours: null,
    totalCost: null,
    notes: "",
    createdAt: "2026-03-17T10:00:00",
  },
  {
    id: "wo-10",
    orderNumber: "WO-1089",
    title: "Kitchen grease trap cleaning",
    description: "Quarterly grease trap cleaning and inspection for commercial kitchen.",
    status: "Assigned",
    priority: "Normal",
    serviceType: "Plumbing Maintenance",
    clientName: "Harbor View Restaurant",
    clientId: "6",
    serviceAddress: "550 Harbor Blvd, Capital City, IL",
    assignee: "Carlos Mendez",
    assigneeId: "emp-4",
    scheduledStart: "2026-03-20T07:00:00",
    scheduledEnd: "2026-03-20T10:00:00",
    estimatedHours: 3,
    actualHours: null,
    totalCost: null,
    notes: "",
    createdAt: "2026-03-17T14:00:00",
  },
];

// --- SCHEDULE EVENTS ---
export interface ScheduleEvent {
  id: string;
  title: string;
  eventType: "Job" | "Appointment" | "Block" | "Recurring";
  startTime: string;
  endTime: string;
  assignee: string;
  assigneeId: string;
  clientName: string | null;
  location: string | null;
  workOrderId: string | null;
  workOrderNumber: string | null;
  status: string;
}

export const scheduleEvents: ScheduleEvent[] = [
  // Today — March 18
  {
    id: "se-1", title: "Thermostat upgrade — smart thermostats", eventType: "Job",
    startTime: "2026-03-18T09:00:00", endTime: "2026-03-18T12:00:00",
    assignee: "Lisa Kim", assigneeId: "emp-3",
    clientName: "Downtown Dental Office", location: "22 Main St, Suite 200",
    workOrderId: "wo-4", workOrderNumber: "WO-1083", status: "In Progress",
  },
  {
    id: "se-2", title: "Water heater install", eventType: "Job",
    startTime: "2026-03-18T11:00:00", endTime: "2026-03-18T15:00:00",
    assignee: "Mike Rodriguez", assigneeId: "emp-1",
    clientName: "Sunset Senior Living", location: "742 Evergreen Terrace",
    workOrderId: "wo-5", workOrderNumber: "WO-1084", status: "Completed",
  },
  {
    id: "se-3", title: "Lunch break", eventType: "Block",
    startTime: "2026-03-18T12:00:00", endTime: "2026-03-18T13:00:00",
    assignee: "Dave Sullivan", assigneeId: "emp-2",
    clientName: null, location: null,
    workOrderId: null, workOrderNumber: null, status: "Block",
  },
  {
    id: "se-4", title: "Team meeting", eventType: "Block",
    startTime: "2026-03-18T16:00:00", endTime: "2026-03-18T17:00:00",
    assignee: "Mike Rodriguez", assigneeId: "emp-1",
    clientName: null, location: "Office",
    workOrderId: null, workOrderNumber: null, status: "Block",
  },
  // Tomorrow — March 19
  {
    id: "se-5", title: "AC maintenance — annual inspection", eventType: "Job",
    startTime: "2026-03-19T08:00:00", endTime: "2026-03-19T11:00:00",
    assignee: "Mike Rodriguez", assigneeId: "emp-1",
    clientName: "Harbor View Restaurant", location: "550 Harbor Blvd",
    workOrderId: "wo-6", workOrderNumber: "WO-1085", status: "Scheduled",
  },
  {
    id: "se-6", title: "Boiler inspection — annual", eventType: "Job",
    startTime: "2026-03-19T13:00:00", endTime: "2026-03-19T16:00:00",
    assignee: "Dave Sullivan", assigneeId: "emp-2",
    clientName: "Sunset Senior Living", location: "742 Evergreen Terrace",
    workOrderId: "wo-9", workOrderNumber: "WO-1088", status: "Scheduled",
  },
  {
    id: "se-7", title: "Site survey — new construction", eventType: "Appointment",
    startTime: "2026-03-19T10:00:00", endTime: "2026-03-19T11:30:00",
    assignee: "Lisa Kim", assigneeId: "emp-3",
    clientName: "Greenfield Schools", location: "500 Academic Rd, Greenfield",
    workOrderId: null, workOrderNumber: null, status: "Scheduled",
  },
  // March 20
  {
    id: "se-8", title: "Kitchen grease trap cleaning", eventType: "Job",
    startTime: "2026-03-20T07:00:00", endTime: "2026-03-20T10:00:00",
    assignee: "Carlos Mendez", assigneeId: "emp-4",
    clientName: "Harbor View Restaurant", location: "550 Harbor Blvd",
    workOrderId: "wo-10", workOrderNumber: "WO-1089", status: "Scheduled",
  },
  {
    id: "se-9", title: "Monthly maintenance — all units", eventType: "Recurring",
    startTime: "2026-03-20T09:00:00", endTime: "2026-03-20T15:00:00",
    assignee: "Mike Rodriguez", assigneeId: "emp-1",
    clientName: "Oak Street Apartments", location: "88 Oak Street",
    workOrderId: null, workOrderNumber: null, status: "Scheduled",
  },
];

// --- INVOICES ---
export type InvoiceStatus = "Draft" | "Sent" | "Viewed" | "Paid" | "Overdue" | "Cancelled";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SampleInvoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  clientName: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  workOrderNumber: string | null;
  notes: string;
  createdAt: string;
}

export const invoices: SampleInvoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2088",
    status: "Paid",
    clientName: "Oak Street Apartments",
    clientId: "2",
    issueDate: "2026-03-16",
    dueDate: "2026-03-30",
    lineItems: [
      { id: "li-1", description: "Emergency pipe burst repair — labor (2.5 hrs)", quantity: 2.5, unitPrice: 150, total: 375 },
      { id: "li-2", description: "Copper pipe 3/4\" (4 ft)", quantity: 4, unitPrice: 18, total: 72 },
      { id: "li-3", description: "Pipe fittings and solder", quantity: 1, unitPrice: 45, total: 45 },
      { id: "li-4", description: "Emergency dispatch fee", quantity: 1, unitPrice: 125, total: 125 },
    ],
    subtotal: 617,
    taxRate: 0.0825,
    taxAmount: 50.90,
    total: 667.90,
    amountPaid: 667.90,
    workOrderNumber: "WO-1080",
    notes: "Emergency repair. Payment received via credit card.",
    createdAt: "2026-03-16T15:00:00",
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2089",
    status: "Paid",
    clientName: "Riverside Property Management",
    clientId: "1",
    issueDate: "2026-03-15",
    dueDate: "2026-04-15",
    lineItems: [
      { id: "li-5", description: "HVAC spring maintenance — labor (4.5 hrs)", quantity: 4.5, unitPrice: 125, total: 562.50 },
      { id: "li-6", description: "HVAC filters 20x25x1 (6 units)", quantity: 6, unitPrice: 24, total: 144 },
      { id: "li-7", description: "Refrigerant top-off — R-410A", quantity: 2, unitPrice: 85, total: 170 },
      { id: "li-8", description: "Coil cleaning solution", quantity: 1, unitPrice: 32, total: 32 },
    ],
    subtotal: 908.50,
    taxRate: 0.0825,
    taxAmount: 74.95,
    total: 983.45,
    amountPaid: 983.45,
    workOrderNumber: "WO-1081",
    notes: "Maintenance contract — net 30. Unit #4 compressor flagged for follow-up.",
    createdAt: "2026-03-15T16:00:00",
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-2090",
    status: "Sent",
    clientName: "Martinez Residence",
    clientId: "3",
    issueDate: "2026-03-17",
    dueDate: "2026-04-01",
    lineItems: [
      { id: "li-9", description: "Water heater replacement — labor (3.5 hrs)", quantity: 3.5, unitPrice: 150, total: 525 },
      { id: "li-10", description: "Bradford White 50-gal gas water heater", quantity: 1, unitPrice: 1200, total: 1200 },
      { id: "li-11", description: "Installation materials (fittings, flex line, T&P valve)", quantity: 1, unitPrice: 85, total: 85 },
      { id: "li-12", description: "Old unit disposal fee", quantity: 1, unitPrice: 75, total: 75 },
    ],
    subtotal: 1885,
    taxRate: 0.0825,
    taxAmount: 155.51,
    total: 2040.51,
    amountPaid: 0,
    workOrderNumber: "WO-1082",
    notes: "50-gallon gas water heater replacement. Due upon receipt.",
    createdAt: "2026-03-17T14:30:00",
  },
  {
    id: "inv-4",
    invoiceNumber: "INV-2091",
    status: "Sent",
    clientName: "Martinez Residence",
    clientId: "3",
    issueDate: "2026-03-18",
    dueDate: "2026-04-01",
    lineItems: [
      { id: "li-13", description: "Tankless water heater install — labor (3 hrs)", quantity: 3, unitPrice: 175, total: 525 },
      { id: "li-14", description: "Rinnai RU199iN tankless water heater", quantity: 1, unitPrice: 1850, total: 1850 },
      { id: "li-15", description: "New gas line run (15 ft)", quantity: 1, unitPrice: 320, total: 320 },
      { id: "li-16", description: "Venting materials and exterior wall cap", quantity: 1, unitPrice: 145, total: 145 },
    ],
    subtotal: 2840,
    taxRate: 0.0825,
    taxAmount: 234.30,
    total: 3074.30,
    amountPaid: 0,
    workOrderNumber: "WO-1084",
    notes: "Tankless water heater installation with new gas line.",
    createdAt: "2026-03-18T09:00:00",
  },
  {
    id: "inv-5",
    invoiceNumber: "INV-2092",
    status: "Draft",
    clientName: "Downtown Dental Office",
    clientId: "4",
    issueDate: "2026-03-18",
    dueDate: "2026-04-17",
    lineItems: [
      { id: "li-17", description: "Smart thermostat install — labor (est. 3 hrs)", quantity: 3, unitPrice: 125, total: 375 },
      { id: "li-18", description: "Ecobee Smart Thermostat Premium", quantity: 3, unitPrice: 250, total: 750 },
      { id: "li-19", description: "Wiring adapters and mounting hardware", quantity: 3, unitPrice: 15, total: 45 },
    ],
    subtotal: 1170,
    taxRate: 0.0825,
    taxAmount: 96.53,
    total: 1266.53,
    amountPaid: 0,
    workOrderNumber: "WO-1083",
    notes: "Draft — pending work order completion.",
    createdAt: "2026-03-18T10:00:00",
  },
  {
    id: "inv-6",
    invoiceNumber: "INV-2086",
    status: "Overdue",
    clientName: "Sunset Senior Living",
    clientId: "7",
    issueDate: "2026-02-18",
    dueDate: "2026-03-04",
    lineItems: [
      { id: "li-20", description: "Monthly maintenance contract — March", quantity: 1, unitPrice: 2400, total: 2400 },
    ],
    subtotal: 2400,
    taxRate: 0,
    taxAmount: 0,
    total: 2400,
    amountPaid: 0,
    workOrderNumber: null,
    notes: "Monthly maintenance contract. Payment overdue — 14 days past due.",
    createdAt: "2026-02-18T09:00:00",
  },
];
