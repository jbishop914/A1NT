// ─── P3 Sample Data ───────────────────────────────────────────────
// Sales & Marketing, Financial Reporting, Fleet & Equipment, Documents & KB

// ═══════════════════════════════════════════════════════════════════
// SALES & MARKETING
// ═══════════════════════════════════════════════════════════════════

export type LeadStage = "New" | "Contacted" | "Qualified" | "Proposal" | "Won" | "Lost";
export type CampaignStatus = "Draft" | "Active" | "Paused" | "Completed";
export type CampaignType = "Email" | "SMS" | "Automated Sequence" | "Direct Mail" | "Referral Program";
export type EstimateStatus = "Draft" | "Sent" | "Viewed" | "Accepted" | "Declined" | "Expired";

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  stage: LeadStage;
  value: number;
  assignedTo: string;
  lastContact: string;
  nextFollowUp: string;
  notes: string;
  score: number; // 0-100 AI lead score
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  audience: string;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  spend: number;
  startDate: string;
  endDate: string | null;
}

export interface Estimate {
  id: string;
  number: string;
  clientName: string;
  title: string;
  status: EstimateStatus;
  amount: number;
  sentDate: string;
  expiresDate: string;
  items: { description: string; qty: number; price: number }[];
  notes: string;
}

export interface Referral {
  id: string;
  referrerName: string;
  referrerType: "Client" | "Partner" | "Employee";
  referredName: string;
  date: string;
  status: "Pending" | "Converted" | "Lost";
  value: number;
  reward: string;
}

export const sampleLeads: Lead[] = [
  {
    id: "lead-1",
    name: "Jennifer Marsh",
    company: "Marsh Property Group",
    email: "jmarsh@marshpg.com",
    phone: "(203) 555-9012",
    source: "Website Form",
    stage: "Proposal",
    value: 12500,
    assignedTo: "Sarah Chen",
    lastContact: "2026-03-17",
    nextFollowUp: "2026-03-19",
    notes: "Interested in annual maintenance contract for 6 commercial properties",
    score: 87,
    createdAt: "2026-03-05",
  },
  {
    id: "lead-2",
    name: "Tom Reyes",
    company: "Reyes Restaurant Group",
    email: "treyes@reyesrg.com",
    phone: "(203) 555-3456",
    source: "Referral",
    stage: "Qualified",
    value: 8200,
    assignedTo: "Sarah Chen",
    lastContact: "2026-03-16",
    nextFollowUp: "2026-03-20",
    notes: "3 restaurant locations need grease trap and plumbing service",
    score: 72,
    createdAt: "2026-03-10",
  },
  {
    id: "lead-3",
    name: "Angela Whitfield",
    company: "Cheshire Senior Living",
    email: "awhitfield@cheshiresl.org",
    phone: "(475) 555-7788",
    source: "AI Receptionist",
    stage: "New",
    value: 25000,
    assignedTo: "Unassigned",
    lastContact: "2026-03-18",
    nextFollowUp: "2026-03-19",
    notes: "Full HVAC system evaluation for 120-unit facility",
    score: 91,
    createdAt: "2026-03-18",
  },
  {
    id: "lead-4",
    name: "Derek Hoffman",
    company: "",
    email: "dhoffman@gmail.com",
    phone: "(860) 555-2211",
    source: "Google Ads",
    stage: "Contacted",
    value: 3500,
    assignedTo: "Mike Rodriguez",
    lastContact: "2026-03-15",
    nextFollowUp: "2026-03-21",
    notes: "Residential water heater replacement — quoted tankless upgrade",
    score: 58,
    createdAt: "2026-03-12",
  },
  {
    id: "lead-5",
    name: "Sunrise Daycare Center",
    company: "Sunrise Daycare Center",
    email: "admin@sunrisedaycare.com",
    phone: "(203) 555-6677",
    source: "Cold Outreach",
    stage: "Won",
    value: 4800,
    assignedTo: "Sarah Chen",
    lastContact: "2026-03-14",
    nextFollowUp: "",
    notes: "Annual backflow testing + fire suppression inspection — converted to WO",
    score: 95,
    createdAt: "2026-02-28",
  },
  {
    id: "lead-6",
    name: "Hartford Insurance HQ",
    company: "Hartford Financial Services",
    email: "facilities@hartfordfs.com",
    phone: "(860) 555-0001",
    source: "Website Form",
    stage: "Lost",
    value: 45000,
    assignedTo: "Sarah Chen",
    lastContact: "2026-03-10",
    nextFollowUp: "",
    notes: "Lost to competitor — pricing was 20% under our bid",
    score: 40,
    createdAt: "2026-02-15",
  },
  {
    id: "lead-7",
    name: "Pine Ridge HOA",
    company: "Pine Ridge Homeowners Assoc",
    email: "board@pineridgehoa.org",
    phone: "(203) 555-4455",
    source: "Referral",
    stage: "Contacted",
    value: 18000,
    assignedTo: "Mike Rodriguez",
    lastContact: "2026-03-17",
    nextFollowUp: "2026-03-22",
    notes: "Community-wide HVAC maintenance contract — 45 units",
    score: 65,
    createdAt: "2026-03-14",
  },
  {
    id: "lead-8",
    name: "Maria Torres",
    company: "",
    email: "mtorres@outlook.com",
    phone: "(203) 555-8899",
    source: "AI Receptionist",
    stage: "New",
    value: 1200,
    assignedTo: "Unassigned",
    lastContact: "2026-03-18",
    nextFollowUp: "2026-03-19",
    notes: "Bathroom remodel plumbing — wants estimate this week",
    score: 45,
    createdAt: "2026-03-18",
  },
];

export const sampleCampaigns: Campaign[] = [
  {
    id: "camp-1",
    name: "Spring HVAC Tune-Up 2026",
    type: "Email",
    status: "Active",
    audience: "Residential Clients — Last Service 6+ Months",
    sent: 342,
    opened: 187,
    clicked: 64,
    converted: 18,
    revenue: 14400,
    spend: 85,
    startDate: "2026-03-01",
    endDate: "2026-04-15",
  },
  {
    id: "camp-2",
    name: "Commercial Quarterly Check-In",
    type: "Email",
    status: "Active",
    audience: "Commercial Clients — Active",
    sent: 48,
    opened: 31,
    clicked: 12,
    converted: 4,
    revenue: 9600,
    spend: 25,
    startDate: "2026-03-10",
    endDate: "2026-03-31",
  },
  {
    id: "camp-3",
    name: "Water Heater Season Promo",
    type: "SMS",
    status: "Completed",
    audience: "Water Heater Clients — 8+ Years Old",
    sent: 127,
    opened: 127,
    clicked: 34,
    converted: 9,
    revenue: 22500,
    spend: 190,
    startDate: "2026-01-15",
    endDate: "2026-02-28",
  },
  {
    id: "camp-4",
    name: "New Homeowner Welcome",
    type: "Automated Sequence",
    status: "Active",
    audience: "New Leads — Website Form",
    sent: 86,
    opened: 52,
    clicked: 28,
    converted: 7,
    revenue: 5600,
    spend: 0,
    startDate: "2026-01-01",
    endDate: null,
  },
  {
    id: "camp-5",
    name: "Referral Rewards Program",
    type: "Referral Program",
    status: "Active",
    audience: "All Active Clients",
    sent: 215,
    opened: 168,
    clicked: 45,
    converted: 12,
    revenue: 18000,
    spend: 1200,
    startDate: "2026-01-01",
    endDate: null,
  },
  {
    id: "camp-6",
    name: "Emergency Prep Guide",
    type: "Direct Mail",
    status: "Draft",
    audience: "All Residential Clients",
    sent: 0,
    opened: 0,
    clicked: 0,
    converted: 0,
    revenue: 0,
    spend: 0,
    startDate: "2026-04-01",
    endDate: "2026-04-30",
  },
];

export const sampleEstimates: Estimate[] = [
  {
    id: "est-1",
    number: "EST-2026-041",
    clientName: "Jennifer Marsh",
    title: "Annual Maintenance Contract — 6 Properties",
    status: "Sent",
    amount: 12500,
    sentDate: "2026-03-17",
    expiresDate: "2026-04-17",
    items: [
      { description: "HVAC bi-annual inspection (per unit × 6)", qty: 12, price: 275 },
      { description: "Plumbing preventative maintenance (per unit × 6)", qty: 6, price: 450 },
      { description: "Emergency priority line — annual", qty: 1, price: 2000 },
      { description: "10% multi-property discount", qty: 1, price: -1200 },
    ],
    notes: "Includes 24-hour emergency response guarantee",
  },
  {
    id: "est-2",
    number: "EST-2026-040",
    clientName: "Tom Reyes",
    title: "Grease Trap Service — 3 Locations",
    status: "Viewed",
    amount: 8200,
    sentDate: "2026-03-16",
    expiresDate: "2026-04-16",
    items: [
      { description: "Grease trap cleaning (per location)", qty: 3, price: 850 },
      { description: "Plumbing inspection (per location)", qty: 3, price: 350 },
      { description: "Backflow preventer testing (per unit)", qty: 6, price: 175 },
      { description: "Monthly maintenance plan (quarterly billing)", qty: 1, price: 2400 },
    ],
    notes: "Quarterly billing available — $2,050/quarter",
  },
  {
    id: "est-3",
    number: "EST-2026-039",
    clientName: "Sunrise Daycare Center",
    title: "Annual Safety & Compliance Package",
    status: "Accepted",
    amount: 4800,
    sentDate: "2026-03-10",
    expiresDate: "2026-04-10",
    items: [
      { description: "Backflow preventer testing & certification", qty: 2, price: 350 },
      { description: "Fire suppression system inspection", qty: 1, price: 1200 },
      { description: "Water quality testing", qty: 4, price: 175 },
      { description: "Emergency plumbing service — annual retainer", qty: 1, price: 2000 },
    ],
    notes: "Converted to WO-1089",
  },
  {
    id: "est-4",
    number: "EST-2026-038",
    clientName: "Derek Hoffman",
    title: "Tankless Water Heater Installation",
    status: "Sent",
    amount: 3500,
    sentDate: "2026-03-15",
    expiresDate: "2026-04-15",
    items: [
      { description: "Rinnai RU199iN tankless unit", qty: 1, price: 2100 },
      { description: "Installation labor", qty: 1, price: 950 },
      { description: "Permit & inspection fee", qty: 1, price: 250 },
      { description: "Old unit removal & disposal", qty: 1, price: 200 },
    ],
    notes: "Customer comparing with two other bids",
  },
  {
    id: "est-5",
    number: "EST-2026-037",
    clientName: "Hartford Financial Services",
    title: "HVAC System Overhaul — HQ Building",
    status: "Declined",
    amount: 45000,
    sentDate: "2026-02-20",
    expiresDate: "2026-03-20",
    items: [
      { description: "RTU replacement (5-ton × 4)", qty: 4, price: 6500 },
      { description: "Ductwork modification", qty: 1, price: 8500 },
      { description: "Controls & thermostat upgrade (zone × 8)", qty: 8, price: 450 },
      { description: "Installation labor (est. 120 hours)", qty: 120, price: 85 },
    ],
    notes: "Lost to competitor — bid was 20% lower",
  },
];

export const sampleReferrals: Referral[] = [
  { id: "ref-1", referrerName: "Oak Street Apartments", referrerType: "Client", referredName: "Jennifer Marsh", date: "2026-03-02", status: "Converted", value: 12500, reward: "$250 service credit" },
  { id: "ref-2", referrerName: "Mike Rodriguez", referrerType: "Employee", referredName: "Tom Reyes", date: "2026-03-08", status: "Pending", value: 8200, reward: "$100 bonus" },
  { id: "ref-3", referrerName: "Martinez Residence", referrerType: "Client", referredName: "Maria Torres", date: "2026-03-17", status: "Pending", value: 1200, reward: "$50 service credit" },
  { id: "ref-4", referrerName: "Sunset Senior Living", referrerType: "Client", referredName: "Pine Ridge HOA", date: "2026-03-12", status: "Pending", value: 18000, reward: "$500 service credit" },
  { id: "ref-5", referrerName: "Dave Sullivan", referrerType: "Employee", referredName: "Sunrise Daycare Center", date: "2026-02-25", status: "Converted", value: 4800, reward: "$100 bonus" },
];

// ═══════════════════════════════════════════════════════════════════
// FINANCIAL REPORTING
// ═══════════════════════════════════════════════════════════════════

export interface MonthlyFinancial {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  jobsCompleted: number;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  budgeted: number;
  icon: string;
}

export interface RevenueByService {
  service: string;
  revenue: number;
  jobs: number;
  avgPerJob: number;
  trend: "up" | "down" | "flat";
}

export interface ARAgingBucket {
  bucket: string;
  count: number;
  total: number;
  clients: { name: string; amount: number; daysOverdue: number }[];
}

export interface TechnicianPerformance {
  name: string;
  initials: string;
  revenue: number;
  jobs: number;
  avgJobValue: number;
  hoursWorked: number;
  costPerJob: number;
  rating: number;
}

export const sampleMonthlyFinancials: MonthlyFinancial[] = [
  { month: "Oct 2025", revenue: 42800, expenses: 28600, profit: 14200, jobsCompleted: 38 },
  { month: "Nov 2025", revenue: 38200, expenses: 26400, profit: 11800, jobsCompleted: 32 },
  { month: "Dec 2025", revenue: 35100, expenses: 25800, profit: 9300, jobsCompleted: 28 },
  { month: "Jan 2026", revenue: 31500, expenses: 24200, profit: 7300, jobsCompleted: 25 },
  { month: "Feb 2026", revenue: 39800, expenses: 27100, profit: 12700, jobsCompleted: 34 },
  { month: "Mar 2026", revenue: 48200, expenses: 30400, profit: 17800, jobsCompleted: 42 },
];

export const sampleExpenseCategories: ExpenseCategory[] = [
  { category: "Labor", amount: 18200, budgeted: 19000, icon: "users" },
  { category: "Parts & Materials", amount: 4943, budgeted: 5500, icon: "package" },
  { category: "Vehicle & Fuel", amount: 3100, budgeted: 3000, icon: "truck" },
  { category: "Insurance", amount: 2200, budgeted: 2200, icon: "shield" },
  { category: "Tools & Equipment", amount: 850, budgeted: 1000, icon: "wrench" },
  { category: "Marketing", amount: 1500, budgeted: 2000, icon: "megaphone" },
  { category: "Office & Software", amount: 680, budgeted: 700, icon: "monitor" },
  { category: "Subcontractors", amount: 2400, budgeted: 2500, icon: "hard-hat" },
];

export const sampleRevenueByService: RevenueByService[] = [
  { service: "HVAC Repair", revenue: 14800, jobs: 12, avgPerJob: 1233, trend: "up" },
  { service: "Plumbing Repair", revenue: 9600, jobs: 14, avgPerJob: 686, trend: "flat" },
  { service: "Water Heater Install", revenue: 8400, jobs: 3, avgPerJob: 2800, trend: "up" },
  { service: "Preventative Maintenance", revenue: 6200, jobs: 8, avgPerJob: 775, trend: "up" },
  { service: "Commercial Service", revenue: 5800, jobs: 3, avgPerJob: 1933, trend: "down" },
  { service: "Emergency Calls", revenue: 3400, jobs: 2, avgPerJob: 1700, trend: "flat" },
];

export const sampleARAgingBuckets: ARAgingBucket[] = [
  {
    bucket: "Current",
    count: 4,
    total: 5231.34,
    clients: [
      { name: "Oak Street Apartments", amount: 2100, daysOverdue: 0 },
      { name: "Martinez Residence", amount: 1450, daysOverdue: 0 },
      { name: "Sunrise Daycare Center", amount: 981.34, daysOverdue: 0 },
      { name: "Robert Chen", amount: 700, daysOverdue: 0 },
    ],
  },
  {
    bucket: "1–30 Days",
    count: 2,
    total: 3550,
    clients: [
      { name: "Sunset Senior Living", amount: 2350, daysOverdue: 22 },
      { name: "Jennifer Walsh", amount: 1200, daysOverdue: 15 },
    ],
  },
  {
    bucket: "31–60 Days",
    count: 1,
    total: 1800,
    clients: [
      { name: "Downtown Dental Office", amount: 1800, daysOverdue: 45 },
    ],
  },
  {
    bucket: "61–90 Days",
    count: 1,
    total: 2400,
    clients: [
      { name: "Pine Ridge HOA", amount: 2400, daysOverdue: 78 },
    ],
  },
  {
    bucket: "90+ Days",
    count: 0,
    total: 0,
    clients: [],
  },
];

export const sampleTechPerformance: TechnicianPerformance[] = [
  { name: "Mike Rodriguez", initials: "MR", revenue: 18400, jobs: 16, avgJobValue: 1150, hoursWorked: 152, costPerJob: 285, rating: 4.9 },
  { name: "Dave Sullivan", initials: "DS", revenue: 14200, jobs: 13, avgJobValue: 1092, hoursWorked: 168, costPerJob: 310, rating: 4.7 },
  { name: "Lisa Kim", initials: "LK", revenue: 10800, jobs: 9, avgJobValue: 1200, hoursWorked: 144, costPerJob: 275, rating: 4.8 },
  { name: "Carlos Mendez", initials: "CM", revenue: 4800, jobs: 4, avgJobValue: 1200, hoursWorked: 160, costPerJob: 340, rating: 4.5 },
];

// ═══════════════════════════════════════════════════════════════════
// FLEET & EQUIPMENT
// ═══════════════════════════════════════════════════════════════════

export type VehicleStatus = "Active" | "In Shop" | "Out of Service";
export type MaintenanceStatus = "Scheduled" | "Overdue" | "Completed" | "In Progress";
export type EquipmentStatus = "Available" | "Checked Out" | "Maintenance" | "Retired";

export interface Vehicle {
  id: string;
  name: string;
  type: "Van" | "Truck" | "Trailer" | "Car";
  make: string;
  model: string;
  year: number;
  vin: string;
  plate: string;
  mileage: number;
  assignedTo: string;
  status: VehicleStatus;
  fuelType: "Gas" | "Diesel";
  lastService: string;
  nextService: string;
  insuranceExpiry: string;
  registrationExpiry: string;
  monthlyFuel: number;
  monthlyMaintenance: number;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  type: string;
  status: MaintenanceStatus;
  scheduledDate: string;
  completedDate: string | null;
  mileageAtService: number | null;
  cost: number;
  vendor: string;
  notes: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  status: EquipmentStatus;
  assignedTo: string;
  location: string;
  purchaseDate: string;
  purchaseCost: number;
  lastInspection: string;
  nextInspection: string;
  condition: "Excellent" | "Good" | "Fair" | "Poor";
}

export const sampleVehicles: Vehicle[] = [
  {
    id: "veh-1",
    name: "Service Van 1",
    type: "Van",
    make: "Ford",
    model: "Transit 250",
    year: 2024,
    vin: "1FTBW2CM0RKA12345",
    plate: "CT-AB1234",
    mileage: 28400,
    assignedTo: "Mike Rodriguez",
    status: "Active",
    fuelType: "Gas",
    lastService: "2026-02-15",
    nextService: "2026-05-15",
    insuranceExpiry: "2026-09-01",
    registrationExpiry: "2026-12-31",
    monthlyFuel: 420,
    monthlyMaintenance: 85,
  },
  {
    id: "veh-2",
    name: "Service Van 2",
    type: "Van",
    make: "Ford",
    model: "Transit 250",
    year: 2023,
    vin: "1FTBW2CM0RKA67890",
    plate: "CT-CD5678",
    mileage: 45200,
    assignedTo: "Dave Sullivan",
    status: "Active",
    fuelType: "Gas",
    lastService: "2026-01-20",
    nextService: "2026-04-20",
    insuranceExpiry: "2026-09-01",
    registrationExpiry: "2026-12-31",
    monthlyFuel: 480,
    monthlyMaintenance: 120,
  },
  {
    id: "veh-3",
    name: "Service Van 3",
    type: "Van",
    make: "Ram",
    model: "ProMaster 1500",
    year: 2024,
    vin: "3C6TRVBG0RE54321",
    plate: "CT-EF9012",
    mileage: 12800,
    assignedTo: "Lisa Kim",
    status: "Active",
    fuelType: "Gas",
    lastService: "2026-03-01",
    nextService: "2026-06-01",
    insuranceExpiry: "2026-09-01",
    registrationExpiry: "2026-12-31",
    monthlyFuel: 350,
    monthlyMaintenance: 45,
  },
  {
    id: "veh-4",
    name: "Utility Truck",
    type: "Truck",
    make: "Ford",
    model: "F-350 Super Duty",
    year: 2022,
    vin: "1FT8W3BT0NED11111",
    plate: "CT-GH3456",
    mileage: 67800,
    assignedTo: "Carlos Mendez",
    status: "In Shop",
    fuelType: "Diesel",
    lastService: "2026-03-15",
    nextService: "2026-03-20",
    insuranceExpiry: "2026-09-01",
    registrationExpiry: "2026-12-31",
    monthlyFuel: 580,
    monthlyMaintenance: 210,
  },
  {
    id: "veh-5",
    name: "Equipment Trailer",
    type: "Trailer",
    make: "Carry-On",
    model: "6x12 Enclosed",
    year: 2023,
    vin: "4YMUL1215PN000001",
    plate: "CT-TR0001",
    mileage: 0,
    assignedTo: "Shared",
    status: "Active",
    fuelType: "Gas",
    lastService: "2026-01-10",
    nextService: "2026-07-10",
    insuranceExpiry: "2026-09-01",
    registrationExpiry: "2026-12-31",
    monthlyFuel: 0,
    monthlyMaintenance: 15,
  },
];

export const sampleMaintenanceRecords: MaintenanceRecord[] = [
  { id: "mnt-1", vehicleId: "veh-4", vehicleName: "Utility Truck", type: "Brake Replacement", status: "In Progress", scheduledDate: "2026-03-15", completedDate: null, mileageAtService: 67800, cost: 1200, vendor: "Fleet Services CT", notes: "Front and rear brake pads + rotors" },
  { id: "mnt-2", vehicleId: "veh-2", vehicleName: "Service Van 2", type: "Oil Change + Inspection", status: "Overdue", scheduledDate: "2026-03-10", completedDate: null, mileageAtService: null, cost: 95, vendor: "Jiffy Lube Cheshire", notes: "Was scheduled but tech was on a job" },
  { id: "mnt-3", vehicleId: "veh-1", vehicleName: "Service Van 1", type: "Oil Change + Tire Rotation", status: "Completed", scheduledDate: "2026-02-15", completedDate: "2026-02-15", mileageAtService: 26200, cost: 120, vendor: "Jiffy Lube Cheshire", notes: "" },
  { id: "mnt-4", vehicleId: "veh-3", vehicleName: "Service Van 3", type: "30K Mile Service", status: "Scheduled", scheduledDate: "2026-04-01", completedDate: null, mileageAtService: null, cost: 450, vendor: "Ram Dealer — Wallingford", notes: "Includes transmission flush" },
  { id: "mnt-5", vehicleId: "veh-1", vehicleName: "Service Van 1", type: "AC Recharge", status: "Scheduled", scheduledDate: "2026-04-15", completedDate: null, mileageAtService: null, cost: 180, vendor: "Fleet Services CT", notes: "Prep for summer" },
  { id: "mnt-6", vehicleId: "veh-4", vehicleName: "Utility Truck", type: "Oil Change", status: "Completed", scheduledDate: "2026-01-20", completedDate: "2026-01-20", mileageAtService: 64500, cost: 110, vendor: "Fleet Services CT", notes: "" },
  { id: "mnt-7", vehicleId: "veh-2", vehicleName: "Service Van 2", type: "New Tires (4)", status: "Completed", scheduledDate: "2026-01-05", completedDate: "2026-01-06", mileageAtService: 42100, cost: 680, vendor: "Town Fair Tire", notes: "All-season Michelin Defender" },
];

export const sampleEquipment: Equipment[] = [
  { id: "eq-1", name: "Rigid RP 351 Press Tool", category: "Plumbing Tools", serialNumber: "RP351-2024-001", status: "Checked Out", assignedTo: "Mike Rodriguez", location: "Van 1", purchaseDate: "2024-06-15", purchaseCost: 2800, lastInspection: "2026-02-01", nextInspection: "2026-08-01", condition: "Excellent" },
  { id: "eq-2", name: "Fluke 116 HVAC Multimeter", category: "HVAC Tools", serialNumber: "FL116-2023-002", status: "Checked Out", assignedTo: "Lisa Kim", location: "Van 3", purchaseDate: "2023-03-20", purchaseCost: 350, lastInspection: "2026-01-15", nextInspection: "2026-07-15", condition: "Good" },
  { id: "eq-3", name: "Milwaukee M18 Drain Snake", category: "Plumbing Tools", serialNumber: "MW18-2024-003", status: "Available", assignedTo: "", location: "Main Warehouse", purchaseDate: "2024-09-01", purchaseCost: 1200, lastInspection: "2026-03-01", nextInspection: "2026-09-01", condition: "Good" },
  { id: "eq-4", name: "Fieldpiece SM480V SMAN", category: "HVAC Tools", serialNumber: "FP480-2023-004", status: "Checked Out", assignedTo: "Dave Sullivan", location: "Van 2", purchaseDate: "2023-08-10", purchaseCost: 680, lastInspection: "2026-02-15", nextInspection: "2026-08-15", condition: "Fair" },
  { id: "eq-5", name: "RIDGID K-45AF Sink Machine", category: "Plumbing Tools", serialNumber: "K45AF-2022-005", status: "Maintenance", assignedTo: "", location: "Shop / Repair Bay", purchaseDate: "2022-04-15", purchaseCost: 450, lastInspection: "2026-03-10", nextInspection: "2026-03-25", condition: "Fair" },
  { id: "eq-6", name: "Yellow Jacket 49967 Manifold", category: "HVAC Tools", serialNumber: "YJ49-2024-006", status: "Available", assignedTo: "", location: "Main Warehouse", purchaseDate: "2024-01-20", purchaseCost: 320, lastInspection: "2026-01-20", nextInspection: "2026-07-20", condition: "Excellent" },
  { id: "eq-7", name: "DeWalt Rotary Hammer Drill", category: "General Tools", serialNumber: "DW26-2023-007", status: "Checked Out", assignedTo: "Carlos Mendez", location: "Truck", purchaseDate: "2023-11-05", purchaseCost: 380, lastInspection: "2026-02-20", nextInspection: "2026-08-20", condition: "Good" },
  { id: "eq-8", name: "FLIR C5 Thermal Camera", category: "Diagnostic", serialNumber: "FLIR-2025-008", status: "Available", assignedTo: "", location: "Main Warehouse", purchaseDate: "2025-06-01", purchaseCost: 500, lastInspection: "2026-03-05", nextInspection: "2026-09-05", condition: "Excellent" },
];

// ═══════════════════════════════════════════════════════════════════
// DOCUMENTS & KNOWLEDGE BASE
// ═══════════════════════════════════════════════════════════════════

export type DocType = "Document" | "Template" | "SOP" | "Form" | "Certificate" | "Training";
export type DocCategory = "Operations" | "HR & Compliance" | "Client-Facing" | "Technical" | "Administrative" | "Safety";

export interface Document {
  id: string;
  name: string;
  type: DocType;
  category: DocCategory;
  fileType: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
  version: number;
  tags: string[];
  status: "Active" | "Draft" | "Archived";
  shared: boolean;
  description: string;
}

export interface KBArticle {
  id: string;
  title: string;
  category: string;
  author: string;
  createdAt: string;
  lastUpdated: string;
  views: number;
  helpful: number;
  status: "Published" | "Draft" | "Under Review";
  tags: string[];
  excerpt: string;
}

export interface FormTemplate {
  id: string;
  name: string;
  category: string;
  fields: number;
  submissions: number;
  lastUsed: string;
  status: "Active" | "Draft" | "Archived";
  assignedTo: string;
}

export const sampleDocuments: Document[] = [
  { id: "doc-1", name: "Employee Handbook 2026", type: "Document", category: "HR & Compliance", fileType: "PDF", size: "2.4 MB", uploadedBy: "Sarah Chen", uploadedAt: "2026-01-05", lastModified: "2026-02-20", version: 3, tags: ["HR", "Onboarding", "Policy"], status: "Active", shared: false, description: "Complete employee policies, benefits, and procedures" },
  { id: "doc-2", name: "Service Agreement — Standard", type: "Template", category: "Client-Facing", fileType: "DOCX", size: "145 KB", uploadedBy: "Sarah Chen", uploadedAt: "2025-08-15", lastModified: "2026-03-01", version: 5, tags: ["Contract", "Client", "Legal"], status: "Active", shared: true, description: "Standard service agreement for residential clients" },
  { id: "doc-3", name: "Water Heater Installation SOP", type: "SOP", category: "Technical", fileType: "PDF", size: "890 KB", uploadedBy: "Mike Rodriguez", uploadedAt: "2025-11-10", lastModified: "2026-01-15", version: 2, tags: ["Water Heater", "Installation", "Step-by-Step"], status: "Active", shared: false, description: "Step-by-step installation procedure for tankless and tank water heaters" },
  { id: "doc-4", name: "Job Completion Checklist", type: "Form", category: "Operations", fileType: "Form", size: "—", uploadedBy: "Mike Rodriguez", uploadedAt: "2025-09-20", lastModified: "2026-02-10", version: 4, tags: ["Checklist", "Quality", "Field"], status: "Active", shared: false, description: "Post-job quality checklist for technicians to complete on-site" },
  { id: "doc-5", name: "OSHA Safety Manual", type: "Document", category: "Safety", fileType: "PDF", size: "5.1 MB", uploadedBy: "Sarah Chen", uploadedAt: "2025-06-01", lastModified: "2026-01-10", version: 2, tags: ["Safety", "OSHA", "Compliance"], status: "Active", shared: false, description: "Workplace safety procedures and OSHA compliance documentation" },
  { id: "doc-6", name: "Commercial Service Contract", type: "Template", category: "Client-Facing", fileType: "DOCX", size: "210 KB", uploadedBy: "Sarah Chen", uploadedAt: "2025-10-05", lastModified: "2026-03-05", version: 3, tags: ["Contract", "Commercial", "Legal"], status: "Active", shared: true, description: "Service agreement template for commercial accounts" },
  { id: "doc-7", name: "New Employee Onboarding Packet", type: "Form", category: "HR & Compliance", fileType: "Form", size: "—", uploadedBy: "Sarah Chen", uploadedAt: "2026-01-15", lastModified: "2026-03-01", version: 2, tags: ["HR", "Onboarding", "New Hire"], status: "Active", shared: false, description: "W-4, I-9, direct deposit, policy acknowledgement, tool issuance" },
  { id: "doc-8", name: "HVAC Troubleshooting Guide", type: "SOP", category: "Technical", fileType: "PDF", size: "1.8 MB", uploadedBy: "Lisa Kim", uploadedAt: "2026-02-01", lastModified: "2026-03-10", version: 1, tags: ["HVAC", "Diagnostic", "Troubleshooting"], status: "Active", shared: false, description: "Diagnostic flowcharts for common HVAC issues" },
  { id: "doc-9", name: "Vehicle Pre-Trip Inspection", type: "Form", category: "Safety", fileType: "Form", size: "—", uploadedBy: "Mike Rodriguez", uploadedAt: "2025-07-20", lastModified: "2025-12-15", version: 3, tags: ["Vehicle", "Safety", "Daily"], status: "Active", shared: false, description: "Daily vehicle safety inspection form for fleet drivers" },
  { id: "doc-10", name: "Q1 2026 Marketing Plan", type: "Document", category: "Administrative", fileType: "PDF", size: "3.2 MB", uploadedBy: "Sarah Chen", uploadedAt: "2025-12-20", lastModified: "2026-01-05", version: 1, tags: ["Marketing", "Strategy", "Q1"], status: "Archived", shared: false, description: "First quarter marketing strategy and budget allocation" },
  { id: "doc-11", name: "Backflow Testing Certification", type: "Certificate", category: "Technical", fileType: "PDF", size: "420 KB", uploadedBy: "Mike Rodriguez", uploadedAt: "2026-01-20", lastModified: "2026-01-20", version: 1, tags: ["Certification", "Backflow", "License"], status: "Active", shared: true, description: "Annual backflow testing certification — expires 2027-01-20" },
  { id: "doc-12", name: "Emergency Procedures", type: "SOP", category: "Safety", fileType: "PDF", size: "1.1 MB", uploadedBy: "Sarah Chen", uploadedAt: "2025-04-10", lastModified: "2026-02-28", version: 4, tags: ["Emergency", "Safety", "Procedures"], status: "Active", shared: false, description: "Emergency response procedures for gas leaks, floods, and injuries" },
];

export const sampleKBArticles: KBArticle[] = [
  { id: "kb-1", title: "How to Diagnose a No-Heat Call", category: "HVAC", author: "Mike Rodriguez", createdAt: "2025-10-15", lastUpdated: "2026-02-20", views: 156, helpful: 42, status: "Published", tags: ["HVAC", "Diagnostic", "Furnace"], excerpt: "Step-by-step diagnostic procedure for residential no-heat service calls, covering thermostat, ignition, gas valve, and blower issues." },
  { id: "kb-2", title: "PEX vs Copper: When to Use Which", category: "Plumbing", author: "Dave Sullivan", createdAt: "2025-11-20", lastUpdated: "2026-01-10", views: 98, helpful: 31, status: "Published", tags: ["Plumbing", "Materials", "Best Practices"], excerpt: "Guide to choosing between PEX and copper piping for residential and commercial applications." },
  { id: "kb-3", title: "Tankless Water Heater Sizing Guide", category: "Plumbing", author: "Mike Rodriguez", createdAt: "2026-01-05", lastUpdated: "2026-03-01", views: 74, helpful: 28, status: "Published", tags: ["Water Heater", "Sizing", "Installation"], excerpt: "How to properly size a tankless water heater based on flow rate, temperature rise, and fixture count." },
  { id: "kb-4", title: "Refrigerant Charging: R-410A Best Practices", category: "HVAC", author: "Lisa Kim", createdAt: "2026-02-10", lastUpdated: "2026-03-15", views: 45, helpful: 19, status: "Published", tags: ["HVAC", "Refrigerant", "R-410A"], excerpt: "Proper refrigerant charging procedures, subcooling/superheat targets, and common mistakes to avoid." },
  { id: "kb-5", title: "Customer Communication Standards", category: "Operations", author: "Sarah Chen", createdAt: "2025-09-01", lastUpdated: "2026-03-10", views: 210, helpful: 65, status: "Published", tags: ["Customer Service", "Communication", "Standards"], excerpt: "Guidelines for professional customer communication including phone scripts, email templates, and on-site etiquette." },
  { id: "kb-6", title: "Mobile RFID Inventory Scanning Guide", category: "Operations", author: "Sarah Chen", createdAt: "2026-03-18", lastUpdated: "2026-03-18", views: 3, helpful: 0, status: "Draft", tags: ["Inventory", "RFID", "Mobile"], excerpt: "How to use the mobile RFID scanner to track parts usage on job sites — scanning, manual fallback, and work order linking." },
];

export const sampleFormTemplates: FormTemplate[] = [
  { id: "form-1", name: "Job Completion Checklist", category: "Operations", fields: 18, submissions: 342, lastUsed: "2026-03-18", status: "Active", assignedTo: "All Technicians" },
  { id: "form-2", name: "Vehicle Pre-Trip Inspection", category: "Safety", fields: 24, submissions: 890, lastUsed: "2026-03-18", status: "Active", assignedTo: "All Drivers" },
  { id: "form-3", name: "New Client Intake", category: "Client-Facing", fields: 15, submissions: 56, lastUsed: "2026-03-17", status: "Active", assignedTo: "Office Staff" },
  { id: "form-4", name: "Equipment Issue Report", category: "Operations", fields: 12, submissions: 23, lastUsed: "2026-03-14", status: "Active", assignedTo: "All Employees" },
  { id: "form-5", name: "Safety Incident Report", category: "Safety", fields: 22, submissions: 4, lastUsed: "2026-02-10", status: "Active", assignedTo: "All Employees" },
  { id: "form-6", name: "Customer Satisfaction Survey", category: "Client-Facing", fields: 8, submissions: 128, lastUsed: "2026-03-16", status: "Active", assignedTo: "Automated — Post-Job" },
];

// ═══════════════════════════════════════════════════════════════════
// WEBSITE BUILDER
// ═══════════════════════════════════════════════════════════════════

export type SiteStatus = "Draft" | "Published" | "Maintenance";
export type SiteTier = "Static" | "Portal" | "Premium";
export type TemplateIndustry = "Plumbing" | "HVAC" | "Electrical" | "Landscaping" | "General Contractor" | "Auto Repair" | "Cleaning" | "Property Management";
export type SectionType = "hero" | "services" | "team" | "reviews" | "contact" | "map" | "promotions" | "gallery" | "about" | "faq";

export interface WebsiteTemplate {
  id: string;
  name: string;
  industry: TemplateIndustry;
  description: string;
  sections: SectionType[];
  popularityScore: number;
  previewStyle: { primary: string; accent: string; font: string };
}

export interface ClientWebsite {
  id: string;
  clientName: string;
  templateId: string;
  subdomain: string;
  customDomain: string | null;
  status: SiteStatus;
  tier: SiteTier;
  publishedAt: string | null;
  lastBuildAt: string | null;
  createdAt: string;
  sections: WebsiteSection[];
  theme: { primaryColor: string; accentColor: string; fontFamily: string; darkMode: boolean };
  seo: { title: string; description: string; ogImage: string | null };
  analytics: WebsiteAnalytics;
}

export interface WebsiteSection {
  type: SectionType;
  visible: boolean;
  order: number;
  sourceModule: string | null;
  lastSynced: string | null;
}

export interface WebsiteAnalytics {
  pageViews30d: number;
  uniqueVisitors30d: number;
  formSubmissions30d: number;
  topPages: { path: string; views: number }[];
  viewsByDay: { date: string; views: number }[];
}

export const websiteTemplates: WebsiteTemplate[] = [
  {
    id: "tpl-1",
    name: "Pro Service",
    industry: "Plumbing",
    description: "Clean, authoritative layout built for service businesses. Hero with CTA, services grid, team section, and integrated contact form.",
    sections: ["hero", "services", "about", "team", "reviews", "contact", "map"],
    popularityScore: 94,
    previewStyle: { primary: "#1e293b", accent: "#3b82f6", font: "Inter" },
  },
  {
    id: "tpl-2",
    name: "Climate Control",
    industry: "HVAC",
    description: "Bold, technical aesthetic with seasonal promotion banners and service area maps. Designed for heating and cooling specialists.",
    sections: ["hero", "services", "promotions", "team", "reviews", "contact", "map", "faq"],
    popularityScore: 87,
    previewStyle: { primary: "#0f172a", accent: "#0ea5e9", font: "DM Sans" },
  },
  {
    id: "tpl-3",
    name: "Greenscape",
    industry: "Landscaping",
    description: "Nature-inspired design with large hero imagery, gallery showcase, and before/after sections. Built for visual portfolios.",
    sections: ["hero", "services", "gallery", "about", "reviews", "contact"],
    popularityScore: 91,
    previewStyle: { primary: "#14532d", accent: "#22c55e", font: "Plus Jakarta Sans" },
  },
  {
    id: "tpl-4",
    name: "PowerLine",
    industry: "Electrical",
    description: "Modern, safety-conscious layout with license/certification display, emergency service banners, and structured services list.",
    sections: ["hero", "services", "about", "reviews", "contact", "map", "faq"],
    popularityScore: 78,
    previewStyle: { primary: "#1c1917", accent: "#f59e0b", font: "Inter" },
  },
  {
    id: "tpl-5",
    name: "FleetPro",
    industry: "Auto Repair",
    description: "Automotive-centric with service menu, online booking CTA, gallery for completed work, and customer review wall.",
    sections: ["hero", "services", "gallery", "reviews", "about", "contact", "map"],
    popularityScore: 82,
    previewStyle: { primary: "#18181b", accent: "#ef4444", font: "Outfit" },
  },
  {
    id: "tpl-6",
    name: "SparkClean",
    industry: "Cleaning",
    description: "Light, fresh design emphasizing trust signals, service packages, and easy booking. Perfect for residential and commercial cleaning.",
    sections: ["hero", "services", "about", "reviews", "promotions", "contact"],
    popularityScore: 85,
    previewStyle: { primary: "#1e40af", accent: "#06b6d4", font: "DM Sans" },
  },
];

export const clientWebsites: ClientWebsite[] = [
  {
    id: "site-1",
    clientName: "Ace Plumbing & Heating",
    templateId: "tpl-1",
    subdomain: "ace-plumbing",
    customDomain: "www.aceplumbingct.com",
    status: "Published",
    tier: "Static",
    publishedAt: "2026-02-15",
    lastBuildAt: "2026-03-17",
    createdAt: "2026-01-20",
    sections: [
      { type: "hero", visible: true, order: 1, sourceModule: null, lastSynced: null },
      { type: "services", visible: true, order: 2, sourceModule: "Service Config", lastSynced: "2026-03-17" },
      { type: "about", visible: true, order: 3, sourceModule: null, lastSynced: null },
      { type: "team", visible: true, order: 4, sourceModule: "Workforce", lastSynced: "2026-03-15" },
      { type: "reviews", visible: true, order: 5, sourceModule: null, lastSynced: null },
      { type: "contact", visible: true, order: 6, sourceModule: "Organization", lastSynced: "2026-03-17" },
      { type: "map", visible: true, order: 7, sourceModule: "Geo", lastSynced: "2026-03-10" },
    ],
    theme: { primaryColor: "#1e293b", accentColor: "#3b82f6", fontFamily: "Inter", darkMode: false },
    seo: { title: "Ace Plumbing & Heating | Licensed Plumbers in CT", description: "24/7 emergency plumbing and heating services in greater Hartford. Licensed, insured, and trusted since 2004.", ogImage: null },
    analytics: {
      pageViews30d: 2847,
      uniqueVisitors30d: 1923,
      formSubmissions30d: 34,
      topPages: [
        { path: "/", views: 1240 },
        { path: "/services", views: 645 },
        { path: "/contact", views: 412 },
        { path: "/about", views: 320 },
        { path: "/reviews", views: 230 },
      ],
      viewsByDay: [
        { date: "2026-03-12", views: 82 }, { date: "2026-03-13", views: 96 },
        { date: "2026-03-14", views: 78 }, { date: "2026-03-15", views: 112 },
        { date: "2026-03-16", views: 68 }, { date: "2026-03-17", views: 105 },
        { date: "2026-03-18", views: 94 },
      ],
    },
  },
  {
    id: "site-2",
    clientName: "Summit HVAC Solutions",
    templateId: "tpl-2",
    subdomain: "summit-hvac",
    customDomain: null,
    status: "Published",
    tier: "Portal",
    publishedAt: "2026-01-28",
    lastBuildAt: "2026-03-18",
    createdAt: "2025-12-15",
    sections: [
      { type: "hero", visible: true, order: 1, sourceModule: null, lastSynced: null },
      { type: "services", visible: true, order: 2, sourceModule: "Service Config", lastSynced: "2026-03-18" },
      { type: "promotions", visible: true, order: 3, sourceModule: "Sales & Marketing", lastSynced: "2026-03-18" },
      { type: "team", visible: true, order: 4, sourceModule: "Workforce", lastSynced: "2026-03-16" },
      { type: "reviews", visible: true, order: 5, sourceModule: null, lastSynced: null },
      { type: "faq", visible: true, order: 6, sourceModule: null, lastSynced: null },
      { type: "contact", visible: true, order: 7, sourceModule: "Organization", lastSynced: "2026-03-18" },
      { type: "map", visible: true, order: 8, sourceModule: "Geo", lastSynced: "2026-03-12" },
    ],
    theme: { primaryColor: "#0f172a", accentColor: "#0ea5e9", fontFamily: "DM Sans", darkMode: false },
    seo: { title: "Summit HVAC Solutions | Heating & Cooling Experts", description: "Professional HVAC installation, repair, and maintenance. Serving the tri-state area with 24/7 emergency service.", ogImage: null },
    analytics: {
      pageViews30d: 4215,
      uniqueVisitors30d: 2890,
      formSubmissions30d: 67,
      topPages: [
        { path: "/", views: 1850 },
        { path: "/services", views: 920 },
        { path: "/promotions", views: 510 },
        { path: "/contact", views: 445 },
        { path: "/reviews", views: 290 },
      ],
      viewsByDay: [
        { date: "2026-03-12", views: 128 }, { date: "2026-03-13", views: 145 },
        { date: "2026-03-14", views: 132 }, { date: "2026-03-15", views: 168 },
        { date: "2026-03-16", views: 98 }, { date: "2026-03-17", views: 155 },
        { date: "2026-03-18", views: 142 },
      ],
    },
  },
  {
    id: "site-3",
    clientName: "Green Valley Landscaping",
    templateId: "tpl-3",
    subdomain: "green-valley",
    customDomain: "www.greenvalleylandscape.com",
    status: "Published",
    tier: "Static",
    publishedAt: "2026-03-01",
    lastBuildAt: "2026-03-16",
    createdAt: "2026-02-10",
    sections: [
      { type: "hero", visible: true, order: 1, sourceModule: null, lastSynced: null },
      { type: "services", visible: true, order: 2, sourceModule: "Service Config", lastSynced: "2026-03-16" },
      { type: "gallery", visible: true, order: 3, sourceModule: "Work Orders", lastSynced: "2026-03-15" },
      { type: "about", visible: true, order: 4, sourceModule: null, lastSynced: null },
      { type: "reviews", visible: true, order: 5, sourceModule: null, lastSynced: null },
      { type: "contact", visible: true, order: 6, sourceModule: "Organization", lastSynced: "2026-03-16" },
    ],
    theme: { primaryColor: "#14532d", accentColor: "#22c55e", fontFamily: "Plus Jakarta Sans", darkMode: false },
    seo: { title: "Green Valley Landscaping | Professional Lawn & Garden", description: "Transform your outdoor space. Design, installation, and maintenance for residential and commercial properties.", ogImage: null },
    analytics: {
      pageViews30d: 1560,
      uniqueVisitors30d: 1120,
      formSubmissions30d: 18,
      topPages: [
        { path: "/", views: 680 },
        { path: "/gallery", views: 420 },
        { path: "/services", views: 240 },
        { path: "/contact", views: 140 },
        { path: "/about", views: 80 },
      ],
      viewsByDay: [
        { date: "2026-03-12", views: 48 }, { date: "2026-03-13", views: 55 },
        { date: "2026-03-14", views: 42 }, { date: "2026-03-15", views: 62 },
        { date: "2026-03-16", views: 38 }, { date: "2026-03-17", views: 58 },
        { date: "2026-03-18", views: 51 },
      ],
    },
  },
  {
    id: "site-4",
    clientName: "BrightWire Electrical",
    templateId: "tpl-4",
    subdomain: "brightwire",
    customDomain: null,
    status: "Draft",
    tier: "Static",
    publishedAt: null,
    lastBuildAt: null,
    createdAt: "2026-03-10",
    sections: [
      { type: "hero", visible: true, order: 1, sourceModule: null, lastSynced: null },
      { type: "services", visible: true, order: 2, sourceModule: null, lastSynced: null },
      { type: "about", visible: false, order: 3, sourceModule: null, lastSynced: null },
      { type: "reviews", visible: false, order: 4, sourceModule: null, lastSynced: null },
      { type: "contact", visible: true, order: 5, sourceModule: "Organization", lastSynced: "2026-03-10" },
    ],
    theme: { primaryColor: "#1c1917", accentColor: "#f59e0b", fontFamily: "Inter", darkMode: false },
    seo: { title: "BrightWire Electrical | Licensed Electricians", description: "Residential and commercial electrical services. Licensed, bonded, insured.", ogImage: null },
    analytics: {
      pageViews30d: 0,
      uniqueVisitors30d: 0,
      formSubmissions30d: 0,
      topPages: [],
      viewsByDay: [],
    },
  },
  {
    id: "site-5",
    clientName: "Metro Auto Care",
    templateId: "tpl-5",
    subdomain: "metro-auto",
    customDomain: "www.metroautocarecenter.com",
    status: "Maintenance",
    tier: "Portal",
    publishedAt: "2025-11-20",
    lastBuildAt: "2026-03-10",
    createdAt: "2025-10-05",
    sections: [
      { type: "hero", visible: true, order: 1, sourceModule: null, lastSynced: null },
      { type: "services", visible: true, order: 2, sourceModule: "Service Config", lastSynced: "2026-03-10" },
      { type: "gallery", visible: true, order: 3, sourceModule: "Work Orders", lastSynced: "2026-03-08" },
      { type: "reviews", visible: true, order: 4, sourceModule: null, lastSynced: null },
      { type: "about", visible: true, order: 5, sourceModule: null, lastSynced: null },
      { type: "contact", visible: true, order: 6, sourceModule: "Organization", lastSynced: "2026-03-10" },
      { type: "map", visible: true, order: 7, sourceModule: "Geo", lastSynced: "2026-03-05" },
    ],
    theme: { primaryColor: "#18181b", accentColor: "#ef4444", fontFamily: "Outfit", darkMode: true },
    seo: { title: "Metro Auto Care | Full-Service Auto Repair", description: "Complete auto repair and maintenance. ASE certified technicians. Fair prices, honest service.", ogImage: null },
    analytics: {
      pageViews30d: 3120,
      uniqueVisitors30d: 2240,
      formSubmissions30d: 45,
      topPages: [
        { path: "/", views: 1380 },
        { path: "/services", views: 720 },
        { path: "/gallery", views: 480 },
        { path: "/contact", views: 310 },
        { path: "/reviews", views: 230 },
      ],
      viewsByDay: [
        { date: "2026-03-12", views: 95 }, { date: "2026-03-13", views: 108 },
        { date: "2026-03-14", views: 88 }, { date: "2026-03-15", views: 125 },
        { date: "2026-03-16", views: 72 }, { date: "2026-03-17", views: 115 },
        { date: "2026-03-18", views: 102 },
      ],
    },
  },
];

// ═══════════════════════════════════════════════════════════════════
// AI RESEARCH — Saved research articles from Perplexity integration
// ═══════════════════════════════════════════════════════════════════

export type ResearchSource = "ai-research" | "ai-quick" | "ai-deep";
export type ResearchStatus = "Saved" | "Published" | "Archived";

export interface SavedResearch {
  id: string;
  title: string;
  query: string;
  summary: string;
  citations: { title: string; url: string }[];
  tags: string[];
  category: string;
  source: ResearchSource;
  status: ResearchStatus;
  savedBy: string;
  savedAt: string;
  views: number;
  helpful: number;
}

export const sampleSavedResearch: SavedResearch[] = [
  {
    id: "res-1",
    title: "R-454B Refrigerant Transition Guide",
    query: "R-454B refrigerant replacement for R-410A HVAC 2026 regulations",
    summary: "R-454B (Opteon XL41) is the leading replacement for R-410A, mandated by EPA AIM Act for new residential HVAC systems starting January 1, 2025. Key points: GWP of 466 vs R-410A's 2,088. Mildly flammable (A2L classification) — requires updated safety protocols and leak detectors. Operating pressures are similar to R-410A, making equipment transition smoother. Carrier, Trane, and Daikin have all released R-454B-compatible equipment lines. Technicians need EPA Section 608 certification update for A2L handling. Existing R-410A systems can be serviced with R-410A until end-of-life.",
    citations: [
      { title: "EPA AIM Act Implementation", url: "https://www.epa.gov/climate-hfcs-reduction/aim-act" },
      { title: "ASHRAE 34 Safety Classification", url: "https://www.ashrae.org/technical-resources/standards-and-guidelines" },
      { title: "Carrier R-454B FAQ", url: "https://www.carrier.com/residential/en/us/r-454b/" },
    ],
    tags: ["HVAC", "Refrigerant", "R-454B", "Regulations", "EPA"],
    category: "HVAC",
    source: "ai-research",
    status: "Published",
    savedBy: "Mike Rodriguez",
    savedAt: "2026-03-15",
    views: 34,
    helpful: 12,
  },
  {
    id: "res-2",
    title: "2026 NEC Code Changes for Residential Electrical",
    query: "2026 NEC national electrical code changes residential",
    summary: "The 2026 NEC introduces several key changes affecting residential work: expanded GFCI requirements now cover all 125V-250V outlets in kitchens, bathrooms, and laundry areas. New tamper-resistant receptacle requirements extend to all dwelling unit locations. Enhanced surge protection now required for all dwelling services. Updated EV charging circuit provisions require a dedicated 240V/50A circuit in new construction garages. Arc-fault circuit interrupter (AFCI) protection extended to all living areas including basements and attached garages.",
    citations: [
      { title: "NFPA 70 - National Electrical Code", url: "https://www.nfpa.org/codes-and-standards/nfpa-70" },
      { title: "EC&M NEC 2026 Preview", url: "https://www.ecmag.com/section/codes-standards" },
    ],
    tags: ["Electrical", "NEC", "Code", "2026", "Residential"],
    category: "Electrical",
    source: "ai-deep",
    status: "Published",
    savedBy: "Dave Sullivan",
    savedAt: "2026-03-12",
    views: 28,
    helpful: 9,
  },
  {
    id: "res-3",
    title: "Proper Brazing Techniques for ACR Copper",
    query: "best practices brazing ACR copper tubing HVAC refrigeration",
    summary: "Key brazing practices for ACR (Air Conditioning & Refrigeration) copper tubing: Always flow nitrogen through the joint during brazing at 2-5 CFH to prevent oxide scale buildup inside the tube. Use BCuP-6 (Sil-Fos 6%) for copper-to-copper joints — no flux needed. For copper-to-brass, use BAg-5 with flux. Heat the tube, not the fitting — capillary action draws the alloy in. Target cherry-red color (1,100-1,500°F). Post-braze: maintain nitrogen flow until joint cools below 500°F. Leak test with electronic detector and 150 PSI nitrogen hold for 24 hours minimum.",
    citations: [
      { title: "HVAC School - Brazing Basics", url: "https://hvacrschool.com/brazing-basics/" },
      { title: "Harris Products Brazing Guide", url: "https://www.harrisproductsgroup.com/en/Expert-Advice/tech-tips" },
    ],
    tags: ["HVAC", "Brazing", "Copper", "Refrigeration", "Best Practices"],
    category: "HVAC",
    source: "ai-research",
    status: "Saved",
    savedBy: "Lisa Kim",
    savedAt: "2026-03-18",
    views: 5,
    helpful: 2,
  },
  {
    id: "res-4",
    title: "Plumbing Permit Requirements by State — 2026",
    query: "plumbing permit requirements homeowner vs contractor 2026 state regulations",
    summary: "Plumbing permit requirements vary significantly by state and municipality. Most states require permits for any work involving water supply, drain/waste/vent (DWV) modifications, water heater installation, or gas piping. Some states (FL, TX, CA) allow homeowner permits for their primary residence but still require licensed contractor for gas work. Typical permit fees range $50-$500 depending on scope. Inspection usually required within 24-48 hours of rough-in and again at final. Working without permits can void insurance claims and create liability at sale. Always check local jurisdiction — county requirements often differ from state minimums.",
    citations: [
      { title: "PHCC - Plumbing Code Resources", url: "https://www.phccweb.org/advocacy/codes-and-standards/" },
      { title: "ICC Building Codes", url: "https://www.iccsafe.org/building-safety-journal/" },
    ],
    tags: ["Plumbing", "Permits", "Regulations", "Compliance"],
    category: "Plumbing",
    source: "ai-quick",
    status: "Published",
    savedBy: "Sarah Chen",
    savedAt: "2026-03-10",
    views: 42,
    helpful: 15,
  },
];
