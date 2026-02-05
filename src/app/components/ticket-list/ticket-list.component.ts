import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { Ticket, Client, Agent } from '../../models';
import { ToastService } from '../ui/toast.service';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-6xl mx-auto">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">Tickets de Soporte</h1>
          <p class="text-sm sm:text-base text-gray-500 mt-1">Gestiona y rastrea solicitudes de clientes</p>
        </div>
        <button (click)="showCreateModal.set(true)" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg shadow-sm font-medium transition-colors flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Nuevo Ticket
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6" [formGroup]="filterForm">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filtros</h3>
          <button (click)="resetFilters()" class="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            Limpiar Filtros
          </button>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Estado</label>
            <select formControlName="status" class="w-full rounded-lg border-gray-300 bg-white text-gray-900 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm">
              <option value="">Todos</option>
              <option value="OPEN">Abierto</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="RESOLVED">Resuelto</option>
            </select>
          </div>
          <div>
             <label class="block text-xs font-medium text-gray-700 mb-1">Agente</label>
             <select formControlName="agentId" class="w-full rounded-lg border-gray-300 bg-white text-gray-900 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm">
               <option value="">Todos los Agentes</option>
               @for (agent of agents(); track agent.id) {
                  <option [value]="agent.id">{{ agent.name }}</option>
               }
             </select>
          </div>
          <div>
             <label class="block text-xs font-medium text-gray-700 mb-1">Cliente</label>
             <select formControlName="clientId" class="w-full rounded-lg border-gray-300 bg-white text-gray-900 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm">
               <option value="">Todos los Clientes</option>
               @for (client of clients(); track client.id) {
                  <option [value]="client.id">{{ client.name }}</option>
               }
             </select>
          </div>
          <div>
             <label class="block text-xs font-medium text-gray-700 mb-1">Desde</label>
             <input type="date" formControlName="from" class="w-full rounded-lg border-gray-300 bg-white text-gray-900 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm">
          </div>
          <div>
             <label class="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
             <input type="date" formControlName="to" class="w-full rounded-lg border-gray-300 bg-white text-gray-900 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm">
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left min-w-[800px]">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-4 font-semibold text-gray-600 text-sm">ID</th>
                <th class="px-6 py-4 font-semibold text-gray-600 text-sm w-1/3">Asunto</th>
                <th class="px-6 py-4 font-semibold text-gray-600 text-sm">Estado</th>
                <th class="px-6 py-4 font-semibold text-gray-600 text-sm">Cliente</th>
                <th class="px-6 py-4 font-semibold text-gray-600 text-sm">Agente</th>
                <th class="px-6 py-4 font-semibold text-gray-600 text-sm">Creado</th>
                <th class="px-6 py-4 font-semibold text-gray-600 text-sm"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (ticket of tickets(); track ticket.id) {
                <tr class="hover:bg-gray-50 transition-colors group">
                  <td class="px-6 py-4 text-sm text-gray-500">#{{ ticket.id }}</td>
                  <td class="px-6 py-4">
                    <div class="font-medium text-gray-900 line-clamp-1">{{ ticket.title }}</div>
                    <div class="text-xs text-gray-400 line-clamp-1 max-w-[200px]">{{ ticket.description }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap"
                      [class.bg-blue-50]="ticket.status === 'OPEN'"
                      [class.text-blue-700]="ticket.status === 'OPEN'"
                      [class.border-blue-200]="ticket.status === 'OPEN'"
                      [class.bg-yellow-50]="ticket.status === 'IN_PROGRESS'"
                      [class.text-yellow-700]="ticket.status === 'IN_PROGRESS'"
                      [class.border-yellow-200]="ticket.status === 'IN_PROGRESS'"
                      [class.bg-green-50]="ticket.status === 'RESOLVED'"
                      [class.text-green-700]="ticket.status === 'RESOLVED'"
                      [class.border-green-200]="ticket.status === 'RESOLVED'">
                      {{ getStatusLabel(ticket.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {{ getClientName(ticket.client_id) }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    @if (ticket.agent_id) {
                      <div class="flex items-center gap-2">
                         <div class="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                           {{ getAgentName(ticket.agent_id).charAt(0) }}
                         </div>
                         {{ getAgentName(ticket.agent_id) }}
                      </div>
                    } @else {
                      <span class="text-gray-400 italic">Sin Asignar</span>
                    }
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {{ ticket.created_at | date:'mediumDate' }}
                  </td>
                  <td class="px-6 py-4 text-right">
                    <a [routerLink]="['/tickets', ticket.id]" class="text-indigo-600 hover:text-indigo-900 font-medium text-sm group-hover:underline">
                      Detalles
                    </a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>No se encontraron tickets con estos filtros.</p>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    @if (showCreateModal()) {
      <div class="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 class="text-lg font-semibold text-gray-800">Crear Nuevo Ticket</h3>
            <button (click)="showCreateModal.set(false)" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>
          <form [formGroup]="createForm" (ngSubmit)="createTicket()" class="p-6 space-y-4">
             <div>
               <label class="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
               <select formControlName="client_id" class="w-full rounded-lg border-gray-300 bg-white text-gray-900 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm">
                 @for (client of clients(); track client.id) {
                   <option [value]="client.id">{{ client.name }}</option>
                 }
               </select>
             </div>
             <div>
               <label class="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
               <input type="text" formControlName="title" class="w-full rounded-lg border-gray-300 bg-white text-gray-900 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" placeholder="Resumen breve del problema">
             </div>
             <div>
               <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
               <textarea formControlName="description" rows="3" class="w-full rounded-lg border-gray-300 bg-white text-gray-900 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" placeholder="Explicación detallada..."></textarea>
             </div>
             <div class="pt-2 flex justify-end gap-3">
               <button type="button" (click)="showCreateModal.set(false)" class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
               <button type="submit" [disabled]="createForm.invalid" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 shadow-sm">Crear Ticket</button>
             </div>
          </form>
        </div>
      </div>
    }
  `
})
export class TicketListComponent implements OnInit {
  ticketService = inject(TicketService);
  toast = inject(ToastService);
  fb: FormBuilder = inject(FormBuilder);

  tickets = signal<Ticket[]>([]);
  clients = signal<Client[]>([]);
  agents = signal<Agent[]>([]);
  showCreateModal = signal(false);

  filterForm = this.fb.group({
    status: [''],
    agentId: [''],
    clientId: [''],
    from: [''],
    to: ['']
  });

  createForm = this.fb.group({
    client_id: [''],
    title: [''],
    description: ['']
  });

  ngOnInit() {
    this.loadData();
    this.filterForm.valueChanges.subscribe(() => this.loadTickets());
  }

  loadData() {
    this.ticketService.getClients().subscribe(c => {
      this.clients.set(c);
      if(c.length > 0) this.createForm.patchValue({client_id: c[0].id.toString()});
    });
    this.ticketService.getAgents().subscribe(a => this.agents.set(a));
    this.loadTickets();
  }

  loadTickets() {
    const filters = this.filterForm.value;
    this.ticketService.getTickets({
      status: filters.status || undefined,
      agentId: filters.agentId ? Number(filters.agentId) : undefined,
      clientId: filters.clientId ? Number(filters.clientId) : undefined,
      from: filters.from || undefined,
      to: filters.to || undefined
    }).subscribe(t => this.tickets.set(t));
  }

  resetFilters() {
    this.filterForm.reset({ status: '', agentId: '', clientId: '', from: '', to: '' });
  }

  createTicket() {
    if (this.createForm.valid) {
      this.ticketService.createTicket({
        client_id: Number(this.createForm.value.client_id),
        title: this.createForm.value.title!,
        description: this.createForm.value.description!
      }).subscribe({
        next: () => {
          this.toast.show('Ticket creado exitosamente');
          this.showCreateModal.set(false);
          this.createForm.reset({ client_id: this.clients()[0]?.id.toString() });
          this.loadTickets();
        },
        error: (err) => this.toast.show(err.error?.error || 'Error al crear ticket', 'error')
      });
    }
  }

  getClientName(id: number): string {
    return this.clients().find(c => c.id === id)?.name || 'Cliente Desconocido';
  }

  getAgentName(id: number): string {
    return this.agents().find(a => a.id === id)?.name || 'Agente Desconocido';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      'OPEN': 'ABIERTO',
      'IN_PROGRESS': 'EN PROGRESO',
      'RESOLVED': 'RESUELTO'
    };
    return map[status] || status;
  }
}