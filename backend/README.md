# 🎫 TicketPro — Enterprise Ticket Management System

**TicketPro** es una solución Full Stack de alto rendimiento para la gestión empresarial de tickets de soporte. Diseñada con una arquitectura moderna, escalable y orientada a reglas de negocio estrictas para garantizar la integridad operativa.

![Angular](https://img.shields.io/badge/Angular-19.0.0-dd0031?style=flat&logo=angular)
![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat&logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479a1?style=flat&logo=mysql)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8?style=flat&logo=tailwindcss)

---

## Características Principales

### Arquitectura Robusta
- **Frontend**: Angular 19+ con **Standalone Components**, **Signals** para gestión de estado reactiva y **Control Flow** nativo (`@if`, `@for`). Diseño UI con TailwindCSS.
- **Backend**: API RESTful con Node.js y Express, utilizando `mysql2` con promesas para operaciones asíncronas eficientes.

### Reglas de Negocio (Business Logic)
El sistema implementa validaciones estrictas en el servidor:
1.  **Máquina de Estados de Tickets**:
    - Flujo unidireccional: `OPEN` ➔ `IN_PROGRESS` ➔ `RESOLVED`.
    - Restricciones: No se puede resolver un ticket sin justificación. No se puede reabrir un ticket resuelto.
2.  **Balanceo de Carga de Agentes**:
    - **Límite Hard**: Un agente no puede tener más de **5 tickets** activos (`IN_PROGRESS`) simultáneamente.
    - El sistema bloquea asignaciones que violen esta regla.

### Funcionalidades
- **Dashboard de Agentes**: Métricas en tiempo real de tickets asignados y resueltos.
- **Gestión de Clientes**: Registro y consulta de historial.
- **Filtrado Avanzado**: Búsqueda de tickets por estado, agente, cliente y rango de fechas.

---

## Guía de Instalación y Ejecución

Sigue estos pasos para levantar el entorno de desarrollo local.

### Prerrequisitos
- Node.js v18+
- MySQL (Local o Remoto)

### 1. Configuración de Base de Datos
El proyecto incluye un script para importar el esquema en una base de datos MySQL.

```bash
# Si tienes acceso a la instancia remota configurada en package.json:
npm run db:import 
# Y luego el MYSQLPASSWORD

MYSQLPASSWORD=dCdHjkGfInNaiZphoZQbeqFZljSMgMtH

# O importa manualmente el archivo database/schema.sql en tu gestor MySQL preferido.
```

### 2. Backend (API)

```bash
cd backend

# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
# Crea un archivo .env en /backend con:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=tu_password
# DB_NAME=ticket_system
# PORT=3000

# 3. Iniciar servidor
npm start
```
> El servidor correrá en `http://localhost:3000`

### 3. Frontend (Angular)

```bash
# En la raíz del proyecto

# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
ng serve
```
> La aplicación estará disponible en `http://localhost:4200`

---

## Documentación de API (Endpoints)

### Clientes (`/clients`)

| Método | Endpoint | Descripción | Payload / Params |
| :---- | :--------- | :------------------------ | :--- |
| `GET` | `/clients` | Listar todos los clientes | - |
| `GET` | `/clients/:id` | Obtener detalle de cliente | - |
| `POST` | `/clients` | Crear nuevo cliente | `{ "name": "John Doe", "email": "john@example.com" }` |

### Agentes (`/agents`)

| Método | Endpoint | Descripción | Payload / Params |
| :---- | :-------- | :--- | :--- |
| `GET` | `/agents` | Listar todos los agentes | - |
| `GET` | `/agents/:id` | Obtener detalle de agente | - |
| `GET` | `/stats/agents` | **Dashboard**: Métricas de carga por agente | - |

### Tickets (`/tickets`)

| Método | Endpoint | Descripción | Payload / Params |
| :---- | :--------- | :------------------------- | :--- |
| `GET` | `/tickets` | Listar tickets con filtros | Query Params: `status`, `agentId`, `clientId`, `from`, `to` |
| `GET` | `/tickets/:id` | Obtener detalle de ticket | - |
| `POST` | `/tickets` | Crear ticket | `{ "client_id": 1, "title": "Error login", "description": "..." }` |
| `PATCH` | `/tickets/:id/assign` | **Asignar Agente** (Valida carga máx 5) | `{ "agentId": 2 }` |
| `PATCH` | `/tickets/:id/status` | **Cambiar Estado** (Valida flujo) | `{ "status": "IN_PROGRESS" }` o `{ "status": "RESOLVED", "resolution": "Fixed" }` |

---

## Estructura del Proyecto

```text
ticketmaster/
├── backend/                # Servidor Node.js/Express
│   ├── server.js           # Entry point y definición de rutas
│   └── package.json        # Dependencias del backend
├── src/                    # Código fuente Angular
│   ├── app/
│   │   ├── core/           # Servicios singleton (Api, State)
│   │   ├── features/       # Módulos funcionales (Tickets, Agents, Clients)
│   │   ├── shared/         # Componentes UI reutilizables
│   │   └── app.component.* # Layout principal (Sidebar, Shell)
│   └── ...
├── database/               # Scripts SQL
└── package.json            # Dependencias del frontend y scripts globales
```

---

© 2026 TicketPro Systems por Sebastian Balvin Mendoza (BALCODER).