export type TicketReason = "Harassment" | "Drop" | "Bad behavior" | "Took extra money";
export type City = "Baghdad" | "Basra" | "Karbala";
export type ServiceType = "Eco" | "Plus";
export type AgentName = "Ahmed" | "Jack";

// Frontend Ticket interface (with Date objects for UI)
export interface Ticket {
  id: string;
  tripId: string;
  tripDate: Date;
  driverId: number;
  reason: TicketReason;
  city: City;
  serviceType: ServiceType;
  customerPhone: string;
  agentName: AgentName;
  createdAt: Date;
}

// API Ticket interface (with string dates from backend)
export interface ApiTicket {
  id: number;
  tripId: string;
  tripDate: string;
  driverId: number;
  reason: string;
  city: string;
  serviceType: string;
  customerPhone: string;
  agentName: string;
  createdAt: string;
}

// Utility function to convert API ticket to frontend ticket
export function apiTicketToTicket(apiTicket: ApiTicket): Ticket {
  return {
    id: apiTicket.id.toString(),
    tripId: apiTicket.tripId,
    tripDate: new Date(apiTicket.tripDate),
    driverId: apiTicket.driverId,
    reason: apiTicket.reason as TicketReason,
    city: apiTicket.city as City,
    serviceType: apiTicket.serviceType as ServiceType,
    customerPhone: apiTicket.customerPhone,
    agentName: apiTicket.agentName as AgentName,
    createdAt: new Date(apiTicket.createdAt),
  };
}
