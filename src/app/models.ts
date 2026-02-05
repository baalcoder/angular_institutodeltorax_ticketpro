
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface Client {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Agent {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Ticket {
  id: number;
  client_id: number;
  agent_id: number | null;
  title: string;
  description: string;
  status: TicketStatus;
  resolution: string | null;
  created_at: string;
  updated_at: string;
}

// Helper for UI
export interface TicketWithDetails extends Ticket {
  clientName: string;
  agentName: string | null;
}
