import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Agent, Client, Ticket, TicketStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);
  // In a real app, use environment.apiUrl
  private apiUrl = 'http://localhost:3000'; 

  // --- CLIENTS ---
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/clients`);
  }

  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/clients/${id}`);
  }

  createClient(client: {name: string, email: string}): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrl}/clients`, client);
  }

  // --- AGENTS ---
  getAgents(): Observable<Agent[]> {
    return this.http.get<Agent[]>(`${this.apiUrl}/agents`);
  }
  
  getAgentStats(): Observable<{agentId: number, totalAssigned: number, totalResolved: number}[]> {
      return this.http.get<any[]>(`${this.apiUrl}/stats/agents`);
  }

  // --- TICKETS ---
  getTickets(filters?: { 
    status?: string, 
    agentId?: number, 
    clientId?: number,
    from?: string,
    to?: string
  }): Observable<Ticket[]> {
    let params = new HttpParams();
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params = params.set(key, value.toString());
            }
        });
    }
    return this.http.get<Ticket[]>(`${this.apiUrl}/tickets`, { params });
  }

  getTicketById(id: number): Observable<Ticket> {
      return this.http.get<Ticket>(`${this.apiUrl}/tickets/${id}`);
  }

  createTicket(data: {client_id: number, title: string, description: string}): Observable<Ticket> {
      return this.http.post<Ticket>(`${this.apiUrl}/tickets`, data);
  }

  assignTicket(ticketId: number, agentId: number): Observable<Ticket> {
      return this.http.patch<Ticket>(`${this.apiUrl}/tickets/${ticketId}/assign`, { agentId });
  }

  updateTicketStatus(ticketId: number, status: TicketStatus, resolution?: string): Observable<Ticket> {
      return this.http.patch<Ticket>(`${this.apiUrl}/tickets/${ticketId}/status`, { status, resolution });
  }
}