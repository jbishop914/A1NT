// ─── Routes & Dispatch Types ─────────────────────────────────────────────────

export type RouteStatus =
  | "DRAFT"
  | "OPTIMIZED"
  | "PUBLISHED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type StopType = "work_order" | "custom" | "delay";

export type WorkOrderType =
  | "estimate"
  | "service"
  | "maintenance"
  | "emergency"
  | "renovation"
  | "inspection";

export interface RouteStop {
  id: string;
  type: StopType;
  workOrderId?: string;
  workOrderType?: WorkOrderType;
  address?: string;
  label?: string; // Display name for the stop
  lat: number;
  lng: number;
  estimatedDuration: number; // minutes at stop
  estimatedArrival?: string; // ISO timestamp
  estimatedDeparture?: string; // ISO timestamp
  actualArrival?: string;
  actualDeparture?: string;
  notes?: string;
  equipmentNeeded?: string[];
  delayReason?: string; // For 'delay' type stops
}

export interface RouteLocation {
  address: string;
  lat: number;
  lng: number;
}

export interface RouteConfig {
  startLocation: RouteLocation;
  endLocation: RouteLocation;
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp (target return)
  defaultStopDuration: number; // minutes
  useAveragedDurations: boolean;
}

export interface VehicleRoute {
  id: string;
  organizationId: string;
  name: string;
  date: string; // ISO date string
  status: RouteStatus;

  // Vehicle assignment
  vehicleId?: string;
  vehicleName?: string;

  // Driver/team
  primaryDriverId?: string;
  primaryDriverName?: string;
  teamMembers: string[]; // Employee IDs
  teamMemberNames: string[]; // Display names

  // Route config
  config: RouteConfig;

  // Stops
  stops: RouteStop[];
  totalDistance?: number; // miles
  totalDuration?: number; // minutes (estimated)
  optimizedOrder?: number[]; // Optimized stop indices
  routeGeometry?: GeoJSON.LineString; // Mapbox directions polyline

  // Equipment checked out
  equipmentIds: string[];
  equipmentNames: string[];

  // Actual tracking
  actualMileage?: number;
  actualReturnTime?: string;

  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// ─── UI / Builder State ───────────────────────────────────────────────────────

export interface RouteBuilderState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  workOrderTypeFilter: WorkOrderType | "all";
  selectedWorkOrderIds: string[];
  primaryDriverId: string;
  teamMemberIds: string[];
  defaultStopDuration: number;
  useAveragedDurations: boolean;
  customStops: Omit<RouteStop, "id">[];
  equipmentIds: string[];
  startLocation: RouteLocation;
  endLocation: RouteLocation;
  startTime: string;
  endTime: string;
}

// ─── Work Order (minimal shape for route building) ────────────────────────────

export interface WorkOrderSummary {
  id: string;
  number: string;
  type: WorkOrderType;
  clientName: string;
  address: string;
  lat: number;
  lng: number;
  scheduledDate?: string;
  estimatedDuration: number; // minutes
  priority: "low" | "normal" | "high" | "urgent";
  notes?: string;
}

// ─── Calendar Event (minimal shape for calendar panel) ───────────────────────

export interface RouteCalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date string
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: "route" | "work_order" | "maintenance" | "other";
  routeId?: string;
  workOrderId?: string;
  assignedTo?: string;
  vehicleName?: string;
  color?: string;
}

// ─── Employee (minimal shape for driver selection) ────────────────────────────

export interface EmployeeSummary {
  id: string;
  name: string;
  role: string;
  phone?: string;
  isAvailable: boolean;
  bookedRouteIds: string[];
}
