/**
 * Express Backend API Server
 * Smart Parking & Priority EV Allocation System
 * Customer Authentication & Admin Management Services + Reports Hub
 */

const express = require('express');
const cors = require('cors');
const { state } = require('./state');
const { allocateSmart, allocateRandom } = require('./allocationEngine');
const { runBatchSimulation, BENCHMARK_METRICS } = require('./simulationEngine');
const { supabase } = require('./supabase');
const {
  syncSpotToSupabase,
  syncCustomerToSupabase,
  syncParkingSessionToSupabase,
  syncReportToSupabase
} = require('./supabaseSync');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// 0. SUPABASE DATABASE CONNECTION STATUS
// -------------------------------------------------------------

// GET /api/supabase/status — Check live connection status to Supabase
app.get('/api/supabase/status', async (req, res) => {
  if (!supabase) {
    return res.json({
      connected: false,
      message: 'Supabase client not initialized. Check .env configuration.'
    });
  }

  try {
    const { data, error } = await supabase
      .from('spots')
      .select('id')
      .limit(1);

    if (error) {
      return res.json({
        connected: true,
        projectUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
        tablesCreated: false,
        message: 'Connected to Supabase project, but tables are not yet created in PostgreSQL. Run server/supabase_schema.sql in the Supabase SQL Editor.',
        error: error.message
      });
    }

    const { count } = await supabase.from('spots').select('*', { count: 'exact' });

    return res.json({
      connected: true,
      projectUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
      tablesCreated: true,
      spotsCount: count,
      message: 'Supabase database tables verified and active.'
    });
  } catch (err) {
    return res.status(500).json({
      connected: false,
      error: err.message
    });
  }
});

// -------------------------------------------------------------
// 1. PUBLIC & MAP ENDPOINTS
// -------------------------------------------------------------

// GET /api/spots — Fetch status, coordinates, and types of all 30 spots
app.get('/api/spots', (req, res) => {
  res.json({
    success: true,
    totalSpots: state.spots.length,
    spots: state.getSpots()
  });
});

// GET /api/users/active — Fetch total active logged-in users and session breakdown
app.get('/api/users/active', (req, res) => {
  res.json({
    success: true,
    data: state.getActiveUsers()
  });
});

// -------------------------------------------------------------
// 2. CUSTOMER & ADMIN AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

// POST /api/auth/login — Universal login for Customer (Driver) and Admin
app.post('/api/auth/login', (req, res) => {
  const { identifier, password, role = 'customer' } = req.body;

  if (role === 'admin' || identifier === 'admin' || identifier === 'admin@smartparking.org') {
    const adminAuth = state.authenticateAdmin(password);
    if (adminAuth.success) {
      return res.json({
        success: true,
        role: 'admin',
        user: {
          id: 'ADMIN-01',
          name: 'System Administrator',
          email: 'admin@smartparking.org',
          role: 'admin'
        },
        session: adminAuth.session,
        activeUsers: state.getActiveUsers()
      });
    } else {
      return res.status(401).json({
        success: false,
        message: adminAuth.message || 'Invalid admin passcode. Use "admin123".'
      });
    }
  }

  // Customer Login
  if (!identifier) {
    return res.status(400).json({ success: false, message: 'Please provide your email, vehicle plate, or name.' });
  }

  const result = state.authenticateCustomer(identifier, password || 'password123');
  if (result.success) {
    return res.json({
      success: true,
      role: 'customer',
      user: result.customer,
      session: result.session,
      activeUsers: state.getActiveUsers()
    });
  } else {
    return res.status(401).json({
      success: false,
      message: result.message
    });
  }
});

// POST /api/auth/register — Customer Sign Up / Registration
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password, vehiclePlate, vehicleType, batteryLevel } = req.body;

  if (!email || !name || !vehiclePlate) {
    return res.status(400).json({
      success: false,
      message: 'Full Name, Email, and Vehicle Plate are required fields.'
    });
  }

  const result = state.registerCustomer({
    name,
    email,
    phone,
    password: password || 'password123',
    vehiclePlate,
    vehicleType: vehicleType || 'EV',
    batteryLevel: vehicleType === 'EV' ? (batteryLevel !== undefined ? Number(batteryLevel) : 50) : null,
    ipAddress: req.ip || '192.168.1.150'
  });

  if (result.success) {
    syncCustomerToSupabase(result.customer);
    return res.json({
      success: true,
      message: 'Customer account registered and logged in successfully.',
      user: result.customer,
      session: result.session,
      activeUsers: state.getActiveUsers()
    });
  } else {
    return res.status(400).json({
      success: false,
      message: result.message
    });
  }
});

// POST /api/auth/logout — End user / admin session
app.post('/api/auth/logout', (req, res) => {
  const { sessionId } = req.body;
  if (sessionId) {
    state.logoutSession(sessionId);
  }
  res.json({
    success: true,
    message: 'Session terminated successfully.',
    activeUsers: state.getActiveUsers()
  });
});

// -------------------------------------------------------------
// 3. ADMIN CUSTOMER DIRECTORY & LOGIN AUDIT ENDPOINTS
// -------------------------------------------------------------

// GET /api/admin/customers — List all registered customers + summary metrics
app.get('/api/admin/customers', (req, res) => {
  const customers = state.getCustomers();
  const totalEVs = customers.filter(c => c.vehicleType === 'EV').length;
  const totalICE = customers.filter(c => c.vehicleType === 'Non-EV').length;
  const activeCount = customers.filter(c => c.status === 'active').length;
  const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  res.json({
    success: true,
    data: {
      customers,
      summary: {
        totalRegistered: customers.length,
        totalEVs,
        totalICE,
        activeCount,
        suspendedCount: customers.length - activeCount,
        totalRevenueInr: Number(totalSpent.toFixed(2)),
        totalRevenue: Number(totalSpent.toFixed(2)),
        totalRevenueUsd: Number(totalSpent.toFixed(2))
      }
    }
  });
});

// POST /api/admin/customers — Admin manually adds a new customer
app.post('/api/admin/customers', (req, res) => {
  const { name, email, phone, vehiclePlate, vehicleType, batteryLevel } = req.body;
  if (!name || !email || !vehiclePlate) {
    return res.status(400).json({ success: false, message: 'Name, email, and vehicle plate are required.' });
  }

  const result = state.registerCustomer({
    name,
    email,
    phone,
    vehiclePlate,
    vehicleType: vehicleType || 'EV',
    batteryLevel: vehicleType === 'EV' ? (batteryLevel ? Number(batteryLevel) : 40) : null
  });

  if (result.success) {
    res.json({
      success: true,
      message: `Customer ${name} registered successfully.`,
      customer: result.customer,
      customers: state.getCustomers()
    });
  } else {
    res.status(400).json({ success: false, message: result.message });
  }
});

// POST /api/admin/customers/:id/toggle-status — Toggle customer active / suspended
app.post('/api/admin/customers/:id/toggle-status', (req, res) => {
  const { id } = req.params;
  const updated = state.toggleCustomerStatus(id);
  if (!updated) {
    return res.status(404).json({ success: false, message: `Customer ${id} not found.` });
  }

  res.json({
    success: true,
    message: `Customer ${updated.name} status changed to ${updated.status}.`,
    customer: updated,
    customers: state.getCustomers()
  });
});

// DELETE /api/admin/customers/:id — Remove customer
app.delete('/api/admin/customers/:id', (req, res) => {
  const { id } = req.params;
  const deleted = state.deleteCustomer(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: `Customer ${id} not found.` });
  }

  res.json({
    success: true,
    message: `Customer ${deleted.name} removed from registry.`,
    customers: state.getCustomers()
  });
});

// GET /api/admin/logins — Full login history feed & audit trail
app.get('/api/admin/logins', (req, res) => {
  res.json({
    success: true,
    logs: state.getLoginLogs(),
    activeSessions: state.getActiveUsers().sessions
  });
});

// -------------------------------------------------------------
// 4. REPORTS SECTION ENDPOINTS (Customer Submission + Admin Review)
// -------------------------------------------------------------

// GET /api/reports — Get reports (Customer views their reports, Admin views all)
app.get('/api/reports', (req, res) => {
  const { userId, role = 'admin' } = req.query;
  const reports = state.getReports(userId, role);
  res.json({
    success: true,
    reports,
    totalCount: reports.length
  });
});

// POST /api/reports — Customer submits a report
app.post('/api/reports', (req, res) => {
  const {
    title,
    category,
    spotId,
    priority,
    customerId,
    customerName,
    customerEmail,
    vehiclePlate,
    description
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Report title and description are required.' });
  }

  const report = state.createReport({
    title,
    category,
    spotId,
    priority,
    customerId,
    customerName,
    customerEmail,
    vehiclePlate,
    description
  });

  syncReportToSupabase(report);

  res.json({
    success: true,
    message: `Report ${report.id} submitted successfully to system operations.`,
    report,
    reports: state.getReports(customerId, 'customer')
  });
});

// POST /api/reports/:id/status — Admin updates report status and resolution notes
app.post('/api/reports/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body; // 'Pending' | 'In Progress' | 'Resolved'

  const updated = state.updateReportStatus(id, status, adminNotes);
  if (!updated) {
    return res.status(404).json({ success: false, message: `Report ${id} not found.` });
  }

  syncReportToSupabase(updated);

  res.json({
    success: true,
    message: `Report ${id} status updated to ${status}.`,
    report: updated,
    reports: state.getReports(null, 'admin')
  });
});

// -------------------------------------------------------------
// 5. PARKING SESSIONS & CHECKOUT MANAGEMENT ENDPOINTS
// -------------------------------------------------------------

// GET /api/parking-sessions/active — List active parking sessions
app.get('/api/parking-sessions/active', (req, res) => {
  const { customerId, role = 'admin' } = req.query;
  const sessions = role === 'admin' 
    ? state.getActiveParkingSessions() 
    : state.getActiveParkingSessions(customerId);
  res.json({
    success: true,
    sessions,
    totalCount: sessions.length
  });
});

// GET /api/parking-sessions/history — List completed parking sessions
app.get('/api/parking-sessions/history', (req, res) => {
  const { customerId, role = 'admin' } = req.query;
  const sessions = role === 'admin'
    ? state.getCompletedParkingSessions()
    : state.getCompletedParkingSessions(customerId);
  res.json({
    success: true,
    sessions,
    totalCount: sessions.length
  });
});

// POST /api/parking-sessions/checkout — Initiate checkout & bill calculation
app.post('/api/parking-sessions/checkout', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'Session ID is required.' });
  }

  const updatedSession = state.requestCheckout(sessionId);
  if (!updatedSession) {
    return res.status(404).json({ success: false, message: `Session ${sessionId} not found.` });
  }

  syncParkingSessionToSupabase(updatedSession);

  res.json({
    success: true,
    message: `Checkout requested for session ${sessionId}. Proceed to exit gate.`,
    session: updatedSession,
    spots: state.getSpots(),
    activeUsers: state.getActiveUsers()
  });
});

// POST /api/parking-sessions/:id/update-charging — Update charging state (e.g., jump to 100% CHARGING_COMPLETE)
app.post('/api/parking-sessions/:id/update-charging', (req, res) => {
  const { id } = req.params;
  const { chargerStatus = 'CHARGING_COMPLETE', batteryLevel = 100, energyUsedKwh = null } = req.body;

  const updatedSession = state.updateChargingStatus(id, chargerStatus, batteryLevel, energyUsedKwh);
  if (!updatedSession) {
    return res.status(404).json({ success: false, message: `Session ${id} not found.` });
  }

  res.json({
    success: true,
    message: `Session ${id} charger status updated to ${chargerStatus}.`,
    session: updatedSession,
    spots: state.getSpots()
  });
});

// POST /api/parking-sessions/:id/verify-exit — Admin simulates or triggers gate exit verification & releases bay
app.post('/api/parking-sessions/:id/verify-exit', (req, res) => {
  const { id } = req.params;
  const result = state.verifyExit(id);
  if (!result) {
    return res.status(404).json({ success: false, message: `Session ${id} not found.` });
  }

  syncSpotToSupabase(result.spot);
  syncParkingSessionToSupabase(result.session);

  res.json({
    success: true,
    message: `Exit verified for session ${id}! Spot ${result.session.spotId} is now AVAILABLE.`,
    session: result.session,
    spot: result.spot,
    spots: result.spots,
    activeUsers: result.activeUsers
  });
});

// -------------------------------------------------------------
// 6. VEHICLE ARRIVAL & ALLOCATION
// -------------------------------------------------------------

// POST /api/vehicles/arrive — Process vehicle arrival
app.post('/api/vehicles/arrive', (req, res) => {
  const {
    vehicleId = `VEH-${Math.floor(100 + Math.random() * 900)}`,
    isEV = false,
    batteryLevel = 100,
    mode = 'smart',
    reserveSpot = false,
    sessionId = null,
    customerId = null
  } = req.body;

  const vehicle = {
    vehicleId,
    customerId,
    isEV: Boolean(isEV),
    batteryLevel: isEV ? Number(batteryLevel) : null,
    arrivedAt: new Date().toISOString()
  };

  const spots = state.getSpots();
  let result;

  if (mode === 'smart') {
    result = allocateSmart(vehicle, spots);
  } else {
    result = allocateRandom(vehicle, spots);
  }

  if (result.success && result.assignedSpot) {
    const spot = state.getSpotById(result.assignedSpot.id);
    if (spot) {
      if (reserveSpot) {
        spot.status = 'reserved';
        spot.reservedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      } else {
        spot.status = 'occupied';
      }
      spot.occupiedBy = vehicle;
    }

    const cust = customerId ? state.getCustomerById(customerId) : null;
    if (cust) {
      cust.totalBookings = (cust.totalBookings || 0) + 1;
      cust.currentStatus = `Parked at ${result.assignedSpot.id}`;
    }

    // Create a new ParkingSession record
    const parkingSession = state.createParkingSession({
      customerId: customerId || 'CUST-GUEST',
      customerName: cust ? cust.name : (vehicle.vehicleId || 'Driver'),
      customerEmail: cust ? cust.email : 'driver@smartparking.org',
      vehiclePlate: vehicle.vehicleId,
      vehicleType: vehicle.isEV ? 'EV' : 'Non-EV',
      spotId: result.assignedSpot.id,
      spotType: result.assignedSpot.type,
      batteryLevel: vehicle.batteryLevel || 20,
      isEV: vehicle.isEV
    });

    if (spot) syncSpotToSupabase(spot);
    if (parkingSession) syncParkingSessionToSupabase(parkingSession);
    if (cust) syncCustomerToSupabase(cust);

    state.recordArrival({
      vehicleId: vehicle.vehicleId,
      customerId,
      isEV: vehicle.isEV,
      batteryLevel: vehicle.batteryLevel,
      assignedSpotId: result.assignedSpot.id,
      assignedSpotType: result.assignedSpot.type,
      mode,
      distanceTraveled: result.distanceTraveled,
      spotsChecked: result.spotsChecked,
      misuseOccurred: result.misuseOccurred,
      priorityAssigned: result.priorityAssigned,
      status: reserveSpot ? 'Reserved (15 min)' : 'Parked'
    });

    state.recordLoginLog({
      userId: customerId || 'GUEST',
      userName: vehicle.vehicleId,
      userEmail: customerId ? `${customerId.toLowerCase()}@smartparking.org` : 'gate-flow@smartparking.org',
      role: 'customer',
      vehiclePlate: vehicle.vehicleId,
      vehicleType: vehicle.isEV ? `EV (${vehicle.batteryLevel}%)` : 'Non-EV',
      ipAddress: req.ip || '192.168.1.1',
      action: `Spot Allocated: ${result.assignedSpot.id} (${result.distanceTraveled}u) | Session: ${parkingSession.id}`,
      status: 'Success'
    });

    if (sessionId) {
      state.removeDriverSeeking(sessionId);
    }

    res.json({
      success: true,
      allocation: result,
      session: parkingSession,
      spots: state.getSpots(),
      activeUsers: state.getActiveUsers()
    });
  } else {
    res.status(400).json({
      success: false,
      message: result.reason || 'Allocation failed.',
      allocation: result,
      spots: state.getSpots()
    });
  }
});

// -------------------------------------------------------------
// 6. ADMIN-ONLY SIMULATION & CHAOS TESTING ENDPOINTS
// -------------------------------------------------------------

// POST /api/simulate — Run batch simulation (Admin only)
app.post('/api/simulate', (req, res) => {
  const { batchSize = 150 } = req.body;
  const simulationResults = runBatchSimulation(Number(batchSize));
  res.json({
    success: true,
    data: simulationResults
  });
});

// POST /api/spots/:id/fault — Chaos Mode / Failure Simulator (Admin only)
app.post('/api/spots/:id/fault', (req, res) => {
  const { id } = req.params;
  const { isFaulty } = req.body;
  const updatedSpot = state.toggleSpotFault(id, isFaulty);

  if (!updatedSpot) {
    return res.status(404).json({ success: false, message: `Spot ${id} not found.` });
  }

  syncSpotToSupabase(updatedSpot);

  res.json({
    success: true,
    message: `Spot ${id} fault state updated to ${updatedSpot.isFaulty}`,
    spot: updatedSpot,
    spots: state.getSpots()
  });
});

// POST /api/spots/:id/override — Manual spot override (Admin only)
app.post('/api/spots/:id/override', (req, res) => {
  const { id } = req.params;
  const { status, vehicleInfo = null } = req.body;

  const updatedSpot = state.setSpotStatus(id, status, vehicleInfo);
  if (!updatedSpot) {
    return res.status(404).json({ success: false, message: `Spot ${id} not found.` });
  }

  res.json({
    success: true,
    message: `Spot ${id} manually overridden to status: ${status}`,
    spot: updatedSpot,
    spots: state.getSpots()
  });
});

// GET /api/benchmark — Direct benchmark metrics
app.get('/api/benchmark', (req, res) => {
  res.json({
    success: true,
    benchmark: BENCHMARK_METRICS
  });
});

// POST /api/reset — Reset lot state and active user counters (Admin only)
app.post('/api/reset', (req, res) => {
  state.reset();
  res.json({
    success: true,
    message: 'System state reset to initial conditions.',
    spots: state.getSpots(),
    activeUsers: state.getActiveUsers()
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`[Smart Parking API] Running on http://localhost:${PORT}`);
  });
}

module.exports = app;
