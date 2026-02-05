import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../services/ticket.service';
import { Agent } from '../../models';

@Component({
  selector: 'app-agent-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-6xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Agentes</h1>
        <p class="text-gray-500 mt-1">Métricas de rendimiento y carga de trabajo</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (agent of agents(); track agent.id) {
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4 mb-6">
               <div class="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                 {{ agent.name.charAt(0) }}
               </div>
               <div>
                 <h3 class="font-bold text-gray-900">{{ agent.name }}</h3>
                 <p class="text-sm text-gray-500">{{ agent.email }}</p>
               </div>
            </div>

            <div class="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-indigo-600">{{ getStat(agent.id, 'assigned') }}</div>
                <div class="text-xs text-gray-500 font-medium uppercase tracking-wider">Activos</div>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{{ getStat(agent.id, 'resolved') }}</div>
                <div class="text-xs text-gray-500 font-medium uppercase tracking-wider">Resueltos</div>
              </div>
            </div>
            
            <div class="mt-4 text-xs text-center text-gray-400">
               ID: {{ agent.id }} • Desde {{ agent.created_at | date:'mediumDate' }}
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AgentListComponent implements OnInit {
  ticketService = inject(TicketService);
  agents = signal<Agent[]>([]);
  stats = signal<{agentId: number, totalAssigned: number, totalResolved: number}[]>([]);

  ngOnInit() {
    this.ticketService.getAgents().subscribe(a => this.agents.set(a));
    this.ticketService.getAgentStats().subscribe(s => this.stats.set(s));
  }

  getStat(agentId: number, type: 'assigned' | 'resolved'): number {
    const stat = this.stats().find(s => s.agentId === agentId);
    if (!stat) return 0;
    return type === 'assigned' ? stat.totalAssigned : stat.totalResolved;
  }
}