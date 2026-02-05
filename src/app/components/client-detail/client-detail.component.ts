import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { Client, Ticket } from '../../models';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (client(); as c) {
      <div class="max-w-4xl mx-auto">
        <div class="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <a routerLink="/clients" class="hover:text-indigo-600">Clientes</a>
          <span>/</span>
          <span>{{ c.name }}</span>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
           <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{{ c.name }}</h1>
           <div class="flex flex-col sm:flex-row gap-2 sm:gap-6 text-gray-600 text-sm sm:text-base">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {{ c.email }}
              </div>
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Unido {{ c.created_at | date:'longDate' }}
              </div>
           </div>
        </div>

        <h2 class="text-xl font-bold text-gray-800 mb-4">Historial de Tickets</h2>
        
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left min-w-[600px]">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-4 font-semibold text-gray-600 text-sm">ID</th>
                  <th class="px-6 py-4 font-semibold text-gray-600 text-sm">Asunto</th>
                  <th class="px-6 py-4 font-semibold text-gray-600 text-sm">Estado</th>
                  <th class="px-6 py-4 font-semibold text-gray-600 text-sm">Última Actualización</th>
                  <th class="px-6 py-4 font-semibold text-gray-600 text-sm"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (ticket of tickets(); track ticket.id) {
                  <tr class="hover:bg-gray-50">
                     <td class="px-6 py-4 text-sm text-gray-500">#{{ ticket.id }}</td>
                     <td class="px-6 py-4 font-medium text-gray-900">{{ ticket.title }}</td>
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
                     <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{{ ticket.updated_at | date:'mediumDate' }}</td>
                     <td class="px-6 py-4 text-right">
                       <a [routerLink]="['/tickets', ticket.id]" class="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Ver &rarr;</a>
                     </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="px-6 py-8 text-center text-gray-500">No se encontraron tickets para este cliente.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    } @else {
      <div class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }
  `
})
export class ClientDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  ticketService = inject(TicketService);
  
  client = signal<Client | undefined>(undefined);
  tickets = signal<Ticket[]>([]);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      this.loadData(id);
    });
  }

  loadData(id: number) {
    this.ticketService.getClientById(id).subscribe(c => this.client.set(c));
    this.ticketService.getTickets({ clientId: id }).subscribe(t => this.tickets.set(t));
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