import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { Ticket, Client, Agent } from '../../models';
import { ToastService } from '../ui/toast.service';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    @if (ticket(); as t) {
      <div class="max-w-5xl mx-auto pb-12">
        <div class="mb-4 sm:mb-6 flex items-center gap-2 text-sm text-gray-500">
          <a routerLink="/tickets" class="hover:text-indigo-600">Tickets</a>
          <span>/</span>
          <span>#{{ t.id }}</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div class="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                <h1 class="text-xl sm:text-2xl font-bold text-gray-900 break-words w-full">{{ t.title }}</h1>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border whitespace-nowrap"
                    [class.bg-blue-50]="t.status === 'OPEN'"
                    [class.text-blue-700]="t.status === 'OPEN'"
                    [class.border-blue-200]="t.status === 'OPEN'"
                    [class.bg-yellow-50]="t.status === 'IN_PROGRESS'"
                    [class.text-yellow-700]="t.status === 'IN_PROGRESS'"
                    [class.border-yellow-200]="t.status === 'IN_PROGRESS'"
                    [class.bg-green-50]="t.status === 'RESOLVED'"
                    [class.text-green-700]="t.status === 'RESOLVED'"
                    [class.border-green-200]="t.status === 'RESOLVED'">
                    {{ getStatusLabel(t.status) }}
                </span>
              </div>
              <p class="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{{ t.description }}</p>
              
              <div class="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-500">
                <div class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Cliente: <span class="font-medium text-gray-900">{{ clientName() }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Creado: {{ t.created_at | date:'medium' }}
                </div>
              </div>
            </div>

            <!-- Resolution Box -->
            @if (t.status === 'RESOLVED') {
              <div class="bg-green-50 rounded-xl shadow-sm border border-green-100 p-4 sm:p-6">
                <h3 class="text-lg font-semibold text-green-900 mb-2 flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                     <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                   </svg>
                   Resolución
                </h3>
                <p class="text-green-800 text-sm sm:text-base">{{ t.resolution }}</p>
              </div>
            }

            <!-- Action: Resolve -->
            @if (t.status === 'IN_PROGRESS') {
              <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Cerrar Ticket</h3>
                <div class="space-y-4">
                  <textarea [formControl]="resolutionControl" rows="4" class="w-full rounded-lg border-gray-300 bg-white text-gray-900 border p-3 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" placeholder="Describa cómo se resolvió el problema..."></textarea>
                  <button (click)="resolveTicket()" 
                    [disabled]="resolutionControl.invalid"
                    class="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Resolver y Cerrar Ticket
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Sidebar Actions -->
          <div class="space-y-6">
            <!-- Agent Assignment -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 class="text-xs sm:text-sm uppercase tracking-wide text-gray-500 font-bold mb-4">Asignación</h3>
              
              @if (t.agent_id) {
                <div class="flex items-center gap-3 mb-4 p-3 bg-indigo-50 rounded-lg">
                  <div class="h-10 w-10 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                     {{ agentName().charAt(0) }}
                  </div>
                  <div class="min-w-0">
                    <div class="text-sm font-bold text-gray-900 truncate">{{ agentName() }}</div>
                    <div class="text-xs text-indigo-600">Agente Asignado</div>
                  </div>
                </div>
              } @else {
                 <div class="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg mb-4 flex gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                     <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                   </svg>
                   Sin Asignar
                 </div>
              }

              @if (t.status !== 'RESOLVED') {
                <div class="space-y-3">
                   <label class="text-xs font-semibold text-gray-500">Asignar a Agente</label>
                   <div class="flex flex-col sm:flex-row gap-2">
                      <select #agentSelect class="flex-1 rounded-lg border-gray-300 bg-white text-gray-900 border text-sm p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm">
                        @for (agent of agents(); track agent.id) {
                          <option [value]="agent.id" [selected]="agent.id === t.agent_id">{{ agent.name }}</option>
                        }
                      </select>
                      <button (click)="assignAgent(agentSelect.value)" class="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors w-full sm:w-auto">
                        Asignar
                      </button>
                   </div>
                   <p class="text-xs text-gray-400">Nota: Los agentes tienen un límite de 5 tickets activos.</p>
                </div>
              }
            </div>

            <!-- Workflow Actions -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 class="text-xs sm:text-sm uppercase tracking-wide text-gray-500 font-bold mb-4">Flujo de trabajo</h3>
              
              @if (t.status === 'OPEN') {
                <button (click)="startProgress()" class="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-all">
                  Iniciar Progreso
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                <p class="text-xs text-center mt-2 text-gray-400">Debe asignarse un agente primero.</p>
              }

              @if (t.status === 'RESOLVED') {
                <div class="text-center text-gray-500 text-sm">
                  El ticket está cerrado.
                </div>
              }
            </div>
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
export class TicketDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  ticketService = inject(TicketService);
  toast = inject(ToastService);
  fb: FormBuilder = inject(FormBuilder);

  ticket = signal<Ticket | undefined>(undefined);
  clients = signal<Client[]>([]);
  agents = signal<Agent[]>([]);

  resolutionControl = this.fb.control('', Validators.required);

  ngOnInit() {
    // Load meta data
    this.ticketService.getClients().subscribe(c => this.clients.set(c));
    this.ticketService.getAgents().subscribe(a => this.agents.set(a));

    this.route.params.subscribe(params => {
      this.loadTicket(Number(params['id']));
    });
  }

  loadTicket(id: number) {
    this.ticketService.getTicketById(id).subscribe({
      next: (t) => {
        this.ticket.set(t);
        if (t?.resolution) {
          this.resolutionControl.setValue(t.resolution);
        }
      },
      error: (err) => this.toast.show('Error al cargar ticket: ' + (err.error?.error || 'No encontrado'), 'error')
    });
  }

  clientName() {
    const cid = this.ticket()?.client_id;
    return this.clients().find(c => c.id === cid)?.name || 'Desconocido';
  }

  agentName() {
    const aid = this.ticket()?.agent_id;
    return this.agents().find(a => a.id === aid)?.name || 'Desconocido';
  }

  assignAgent(agentId: string) {
    const tid = this.ticket()?.id;
    if (!tid) return;

    this.ticketService.assignTicket(tid, Number(agentId)).subscribe({
      next: (updated) => {
        this.ticket.set(updated);
        this.toast.show('Agente asignado exitosamente');
      },
      error: (err) => this.toast.show(err.error?.error || 'Error al asignar', 'error')
    });
  }

  startProgress() {
    const tid = this.ticket()?.id;
    if (!tid) return;

    this.ticketService.updateTicketStatus(tid, 'IN_PROGRESS').subscribe({
      next: (updated) => {
        this.ticket.set(updated);
        this.toast.show('Ticket movido a En Progreso');
      },
      error: (err) => this.toast.show(err.error?.error || 'Error al actualizar', 'error')
    });
  }

  resolveTicket() {
    const tid = this.ticket()?.id;
    if (!tid) return;

    this.ticketService.updateTicketStatus(tid, 'RESOLVED', this.resolutionControl.value!).subscribe({
      next: (updated) => {
        this.ticket.set(updated);
        this.toast.show('Ticket resuelto exitosamente');
      },
      error: (err) => this.toast.show(err.error?.error || 'Error al resolver', 'error')
    });
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