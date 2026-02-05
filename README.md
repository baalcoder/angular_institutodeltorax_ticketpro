# TicketPro — Enterprise Ticket Management System

> **Arquitectura de Software Moderna con Angular 19+**

Solución Full Stack de alto rendimiento para la gestión de tickets de soporte, diseñada bajo principios de **Clean Architecture** y utilizando las últimas primitivas reactivas del ecosistema Angular.

![Angular Version](https://img.shields.io/badge/Angular-19.0.0-dd0031?style=flat&logo=angular)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.0-38bdf8?style=flat&logo=tailwindcss)
![NodeJS](https://img.shields.io/badge/Node.js-Express-green?style=flat&logo=nodedotjs)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Stack Tecnológico

### Frontend (Angular 19)
- **Core**: Standalone Components (No NgModules).
- **Reactivity**: **Angular Signals** (`signal`, `computed`, `effect`) para gestión de estado granular sin Zone.js overhead.
- **Control Flow**: Nueva sintaxis nativa (`@if`, `@for`, `@switch`) para templates más limpios y performantes.
- **Styling**: **TailwindCSS** para un diseño responsivo, utilitario y mantenible.
- **Performance**: Detección de cambios optimizada (`OnPush`).

### Backend (Node.js)
- **API**: RESTful API con Express.
- **Database**: MySQL (Instancia Cloud en Railway).
- **Architecture**: Controladores y Servicios separados para lógica de negocio.

---

## Funcionalidades y Reglas de Negocio

El sistema implementa lógica de dominio estricta para garantizar la integridad de los datos y procesos.

### 1. Ciclo de Vida de Tickets (State Machine)
El flujo de estados es unidireccional y validado estrictamente:
- `OPEN` ➔ `IN_PROGRESS` ➔ `RESOLVED`
- **Restricciones**:
  - No se puede cerrar un ticket directamente desde `OPEN`.
  - No se puede reabrir un ticket `RESOLVED`.
  - Para iniciar (`IN_PROGRESS`), **debe** haber un agente asignado.
  - Para resolver (`RESOLVED`), **debe** existir una justificación/solución.

### 2. Gestión de Carga de Trabajo (Load Balancing)
Algoritmo de asignación inteligente para prevenir saturación de agentes:
- **Límite Hard**: Un agente no puede tener más de **5 tickets** activos (`IN_PROGRESS`) simultáneamente.
- El sistema bloquea intentos de asignación que violen esta regla.

### 3. Dashboard & UI
- **Sidebar Responsivo**: Navegación adaptativa móvil/desktop con transiciones suaves.
- **Toast Notifications**: Sistema de notificaciones reactivo basado en Signals para feedback inmediato (Éxito/Error).

---

## Guía de Instalación

Sigue estos pasos para desplegar el entorno de desarrollo local.

### Prerrequisitos
- Node.js v18.13.0 o superior.
- NPM v9 o superior.

### 1. Backend (API & Base de Datos)
El backend está pre-configurado para conectar a una base de datos MySQL remota (Railway). No requieres instalación local de MySQL.

```bash
cd backend

# 1. Instalar dependencias
npm install

# 2. Iniciar servidor (Puerto 3000)
npm start
```

### 2. Frontend (Angular App)

```bash
# En la raíz del proyecto

# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
ng serve
```
Accede a la aplicación en: `http://localhost:4200`

---

## Estructura del Proyecto

La arquitectura sigue una organización por **Features** para escalabilidad.

```text
src/
├── app/
│   ├── core/           # Servicios singleton, Guards, Interceptors
│   ├── features/       # Módulos de negocio (Lazy Loaded)
│   │   ├── auth/       # Login y recuperación
│   │   ├── tickets/    # Gestión de tickets (Lista, Detalle, Kanban)
│   │   ├── agents/     # Gestión de agentes
│   │   └── clients/    # Gestión de clientes
│   ├── shared/         # Componentes UI reutilizables (Dumb Components)
│   ├── app.routes.ts   # Routing principal
│   └── app.component.* # Layout principal (Shell)
├── assets/             # Imágenes y recursos estáticos
└── styles.css          # Configuración global de TailwindCSS
```

## Testing

El proyecto incluye scripts para validar la lógica de negocio crítica en el backend.

```bash
# Ejecutar suite de pruebas de reglas de negocio
node backend/tests/business-rules.test.js
```

---

© 2026 TicketPro Systems. Desarrollado con excelencia técnica por Sebastian Balvin Mendoza (BALCODER).