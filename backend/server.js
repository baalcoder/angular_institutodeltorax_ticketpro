require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection Configuration
const dbConfig = {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'password',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'ticket_system',
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

console.log(`Attempting to connect to database: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`);

const pool = mysql.createPool(dbConfig);

// --- ROUTES ---

// 1. Clients
app.get('/clients', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM clients ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/clients/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Client not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/clients', async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
    try {
        const [result] = await pool.query('INSERT INTO clients (name, email) VALUES (?, ?)', [name, email]);
        res.status(201).json({ id: result.insertId, name, email, created_at: new Date() });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Agents
app.get('/agents', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM agents ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Agent Stats (NEW for Agent Dashboard)
app.get('/stats/agents', async (req, res) => {
    try {
        const query = `
            SELECT 
                a.id as agentId,
                (SELECT COUNT(*) FROM tickets t WHERE t.agent_id = a.id AND t.status = 'IN_PROGRESS') as totalAssigned,
                (SELECT COUNT(*) FROM tickets t WHERE t.agent_id = a.id AND t.status = 'RESOLVED') as totalResolved
            FROM agents a
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/agents/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM agents WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Agent not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Tickets
// Get Ticket by ID (NEW)
app.get('/tickets/:id', async (req, res) => {
    // Check if ID is a number to avoid conflict with other routes if order changes, though express handles specific matches well.
    if (isNaN(req.params.id)) return res.next(); 
    
    try {
        const [rows] = await pool.query('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/tickets', async (req, res) => {
    const { status, agentId, clientId, from, to } = req.query;
    let query = 'SELECT * FROM tickets WHERE 1=1';
    const params = [];

    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }
    if (agentId) {
        query += ' AND agent_id = ?';
        params.push(agentId);
    }
    if (clientId) {
        query += ' AND client_id = ?';
        params.push(clientId);
    }
    if (from) {
        query += ' AND created_at >= ?';
        params.push(from);
    }
    if (to) {
        query += ' AND created_at <= ?';
        params.push(to);
    }

    query += ' ORDER BY updated_at DESC';

    try {
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/tickets', async (req, res) => {
    const { client_id, title, description } = req.body;
    if (!client_id || !title) return res.status(400).json({ error: 'Client ID and Title are required' });

    try {
        const [result] = await pool.query(
            'INSERT INTO tickets (client_id, title, description, status) VALUES (?, ?, ?, "OPEN")',
            [client_id, title, description || '']
        );
        const [newTicket] = await pool.query('SELECT * FROM tickets WHERE id = ?', [result.insertId]);
        res.status(201).json(newTicket[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Assign Ticket
app.patch('/tickets/:id/assign', async (req, res) => {
    const ticketId = req.params.id;
    const { agentId } = req.body;

    if (!agentId) return res.status(400).json({ error: 'Agent ID is required' });

    try {
        // BUSINESS RULE: An agent cannot have more than 5 tickets IN_PROGRESS
        const [activeTickets] = await pool.query(
            'SELECT COUNT(*) as count FROM tickets WHERE agent_id = ? AND status = "IN_PROGRESS"',
            [agentId]
        );

        if (activeTickets[0].count >= 5) {
            return res.status(422).json({ 
                error: 'Business Rule Violation: Agent has reached maximum capacity (5 active tickets).' 
            });
        }

        await pool.query('UPDATE tickets SET agent_id = ? WHERE id = ?', [agentId, ticketId]);
        const [updated] = await pool.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
        res.json(updated[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Status
app.patch('/tickets/:id/status', async (req, res) => {
    const ticketId = req.params.id;
    const { status, resolution } = req.body;

    if (!['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        // Get current ticket state
        const [rows] = await pool.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
        const ticket = rows[0];

        // RULE: Cannot reopen resolved
        if (ticket.status === 'RESOLVED') {
            return res.status(422).json({ error: 'Cannot re-open a RESOLVED ticket.' });
        }

        // RULE: OPEN -> RESOLVED forbidden
        if (ticket.status === 'OPEN' && status === 'RESOLVED') {
            return res.status(422).json({ error: 'Cannot go from OPEN to RESOLVED directly.' });
        }

        // RULE: IN_PROGRESS requires agent
        if (status === 'IN_PROGRESS' && !ticket.agent_id) {
            return res.status(422).json({ error: 'Ticket must be assigned to an agent before starting progress.' });
        }

        // RULE: RESOLVED requires resolution
        if (status === 'RESOLVED' && (!resolution || resolution.trim() === '')) {
            return res.status(422).json({ error: 'Resolution text is mandatory.' });
        }
        
        // RULE: Agent Capacity Check (Edge case: moving from OPEN to IN_PROGRESS if agent assigned)
        if (status === 'IN_PROGRESS' && ticket.status !== 'IN_PROGRESS' && ticket.agent_id) {
             const [active] = await pool.query(
                'SELECT COUNT(*) as count FROM tickets WHERE agent_id = ? AND status = "IN_PROGRESS"',
                [ticket.agent_id]
            );
            if (active[0].count >= 5) {
                return res.status(422).json({ error: 'Assigned agent is at capacity.' });
            }
        }

        await pool.query(
            'UPDATE tickets SET status = ?, resolution = ? WHERE id = ?', 
            [status, status === 'RESOLVED' ? resolution : null, ticketId]
        );
        
        const [updated] = await pool.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
        res.json(updated[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});