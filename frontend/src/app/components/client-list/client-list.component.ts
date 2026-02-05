import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { Client } from '../../models';
import { ToastService } from '../ui/toast.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6 sm:mb-8">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">Clientes</h1>
          <p class="text-gray-500 mt-1 text-sm sm:text-base">Gestionar directorio de clientes</p>
        </div>
        
        <button (click)="showCreate.set(!showCreate())" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base">
          {{ showCreate() ? 'Cancelar' : 'Agregar Cliente' }}
        </button>
      </div>

      @if (showCreate()) {
        <div class="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 mb-6 animate-fade-in">
           <h3 class="font-semibold text-gray-800 mb-4">Nuevo Cliente</h3>
           <form [formGroup]="form" (ngSubmit)="createClient()" class="flex flex-col sm:flex-row gap-4 sm:items-end">
             <div class="flex-1">
               <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de Empresa</label>
               <input type="text" formControlName="name" class="w-full rounded-lg border-gray-300 bg-white text-gray-900 border p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" placeholder="Ej. Wayne Enterprises">
             </div>
             <div class="flex-1">
               <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
               <input type="email" formControlName="email" class="w-full rounded-lg border-gray-300 bg-white text-gray-900 border p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" placeholder="contacto@dominio.com">
             </div>
             <button type="submit" [disabled]="form.invalid" class="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">Guardar</button>
           </form>
        </div>
      }

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left min-w-[600px]">
             <thead class="bg-gray-50 border-b border-gray-200">
               <tr>
                 <th class="px-6 py-4 font-semibold text-gray-600">Nombre</th>
                 <th class="px-6 py-4 font-semibold text-gray-600">Email</th>
                 <th class="px-6 py-4 font-semibold text-gray-600">Unido</th>
                 <th class="px-6 py-4 font-semibold text-gray-600">Acción</th>
               </tr>
             </thead>
             <tbody class="divide-y divide-gray-100">
               @for (client of clients(); track client.id) {
                 <tr class="hover:bg-gray-50">
                   <td class="px-6 py-4 font-medium text-gray-900">{{ client.name }}</td>
                   <td class="px-6 py-4 text-gray-600">{{ client.email }}</td>
                   <td class="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">{{ client.created_at | date:'mediumDate' }}</td>
                   <td class="px-6 py-4 text-gray-400 text-sm">
                     <a [routerLink]="['/clients', client.id]" class="text-indigo-600 hover:text-indigo-900 font-medium text-sm whitespace-nowrap">Ver Detalles &rarr;</a>
                   </td>
                 </tr>
               }
             </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <style>
      .animate-fade-in { animation: fadeIn 0.3s ease-in; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
  `
})
export class ClientListComponent implements OnInit {
  ticketService = inject(TicketService);
  fb: FormBuilder = inject(FormBuilder);
  toast = inject(ToastService);

  clients = signal<Client[]>([]);
  showCreate = signal(false);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.ticketService.getClients().subscribe(c => this.clients.set(c));
  }

  createClient() {
    if (this.form.valid) {
      this.ticketService.createClient({
        name: this.form.value.name!,
        email: this.form.value.email!
      }).subscribe({
        next: () => {
          this.toast.show('Cliente agregado exitosamente');
          this.form.reset();
          this.showCreate.set(false);
          this.load();
        },
        error: (err) => this.toast.show(err.error?.error || 'Error al crear cliente', 'error')
      });
    }
  }
}