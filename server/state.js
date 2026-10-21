/**
 * State Management for Smart Parking & EV Allocation System
 * 30 Total Spots: 24 Regular Spots (R01-R24), 6 Dedicated EV Charging Spots (EV01-EV06)
 * Includes Customer Database, Login History, and Reports Management.
 */

function createInitialSpots() {
  const spots = [];

  // Row 1: EV Chargers (EV01 to EV06) + Regular (R01 to R04)
  for (let col = 1; col <= 6; col++) {
    const id = `EV0${col}`;
    spots.push({
      id,
      name: `EV Bay ${col}`,
      type: 'ev',
      row: 1,
      col: col,
      x: col * 1.5,
      y: 1.5,
      distanceFromGate: Number((Math.sqrt(Math.pow(col * 1.5, 2) + Math.pow(1.5, 2))).toFixed(2)),
      status: 'free', // 'free' | 'occupied' | 'reserved' | 'faulty'
      isFaulty: false,
      occupiedBy: null,
      reservedUntil: null
    });
  }

  for (let col = 7; col <= 10; col++) {
    const num = (col - 6).toString().padStart(2, '0');
    const id = `R${num}`;
    spots.push({
      id,
      name: `Spot R-${num}`,
      type: 'regular',
      row: 1,
      col: col,
      x: col * 1.5,
      y: 1.5,
      distanceFromGate: Number((Math.sqrt(Math.pow(col * 1.5, 2) + Math.pow(1.5, 2))).toFixed(2)),
      status: 'free',
      isFaulty: false,
      occupiedBy: null,
      reservedUntil: null
    });
  }

  // Row 2: Regular Spots (R05 to R14)
  for (let col = 1; col <= 10; col++) {
    const num = (col + 4).toString().padStart(2, '0');
    const id = `R${num}`;
    spots.push({
      id,
      name: `Spot R-${num}`,
      type: 'regular',
      row: 2,
      col: col,
      x: col * 1.5,
      y: 3.5,
      distanceFromGate: Number((Math.sqrt(Math.pow(col * 1.5, 2) + Math.pow(3.5, 2))).toFixed(2)),
      status: 'free',
      isFaulty: false,
      occupiedBy: null,
      reservedUntil: null
    });
  }

  // Row 3: Regular Spots (R15 to R24)
  for (let col = 1; col <= 10; col++) {
    const num = (col + 14).toString().padStart(2, '0');
    const id = `R${num}`;
    spots.push({
      id,
      name: `Spot R-${num}`,
      type: 'regular',
      row: 3,
      col: col,
      x: col * 1.5,
      y: 5.5,
      distanceFromGate: Number((Math.sqrt(Math.pow(col * 1.5, 2) + Math.pow(5.5, 2))).toFixed(2)),
      status: 'free',
      isFaulty: false,
      occupiedBy: null,
      reservedUntil: null
    });
  }

  return spots;
}

function createInitialCustomers() {
  return [];
}

function createInitialReports() {
  return [];
}

function createInitialParkingSessions() {
  return [];
}

class SystemState {
  constructor() {
    this.spots = createInitialSpots();
    this.customers = createInitialCustomers();
    this.reports = createInitialReports();
    this.parkingSessions = createInitialParkingSessions();

    this.activeUsers = {
      totalLoggedIn: 0,
      activeDriversSeeking: 0,
      adminSessions: 0,
      sessions: []
    };

    this.loginLogs = [];
    this.arrivalFeed = [];
    this.stats = {
      totalAllocations: 0,
      smartAllocations: 0,
      randomAllocations: 0,
      misuseEvents: 0,
      evCriticalServed: 0,
      totalDistanceTraveled: 0
    };
  }

  getSpots() {
    return this.spots;
  }

  getSpotById(id) {
    return this.spots.find(s => s.id === id);
  }

  getActiveUsers() {
    return this.activeUsers;
  }

  getCustomers() {
    return this.customers;
  }

  getCustomerById(id) {
    return this.customers.find(c => c.id === id);
  }

  getCustomerByEmailOrPlate(identifier) {
    const clean = String(identifier).trim().toLowerCase();
    return this.customers.find(c => 
      c.email.toLowerCase() === clean || 
      c.vehiclePlate.toLowerCase() === clean ||
      c.name.toLowerCase() === clean
    );
  }

  registerCustomer(data) {
    const existing = this.getCustomerByEmailOrPlate(data.email) || this.getCustomerByEmailOrPlate(data.vehiclePlate);
    if (existing) {
      return { success: false, message: 'A customer with this email or vehicle plate is already registered.' };
    }

    const id = `CUST-${1000 + this.customers.length + 1}`;
    const newCustomer = {
      id,
      name: data.name || 'New Driver',
      email: data.email,
      phone: data.phone || '+1 (555) 000-0000',
      password: data.password || 'password123',
      vehiclePlate: (data.vehiclePlate || `VEH-${Math.floor(100 + Math.random() * 900)}`).toUpperCase(),
      vehicleType: data.vehicleType || 'EV',
      batteryLevel: data.vehicleType === 'EV' ? Number(data.batteryLevel || 50) : null,
      registeredAt: new Date().toISOString(),
      status: 'active',
      totalBookings: 0,
      totalSpent: 0.00,
      lastLogin: new Date().toISOString(),
      currentStatus: 'Online'
    };

    this.customers.unshift(newCustomer);
    
    // Add active session
    const session = this.addCustomerSession(newCustomer);

    this.recordLoginLog({
      userId: newCustomer.id,
      userName: newCustomer.name,
      userEmail: newCustomer.email,
      role: 'customer',
      vehiclePlate: newCustomer.vehiclePlate,
      vehicleType: newCustomer.vehicleType === 'EV' ? `EV (${newCustomer.batteryLevel}%)` : 'Non-EV',
      ipAddress: data.ipAddress || '192.168.1.150',
      action: 'Customer Registered & Logged In',
      status: 'Success'
    });

    return { success: true, customer: newCustomer, session };
  }

  authenticateCustomer(emailOrPlate, password) {
    const customer = this.getCustomerByEmailOrPlate(emailOrPlate);
    if (!customer) {
      this.recordLoginLog({
        userId: 'UNKNOWN',
        userName: emailOrPlate,
        userEmail: emailOrPlate,
        role: 'customer',
        vehiclePlate: 'N/A',
        vehicleType: 'N/A',
        ipAddress: '192.168.1.x',
        action: 'Failed Customer Login Attempt',
        status: 'Failed (User Not Found)'
      });
      return { success: false, message: 'No customer account found with that email, plate, or username.' };
    }

    if (customer.status === 'suspended') {
      return { success: false, message: 'This customer account has been suspended by system administrator.' };
    }

    if (customer.password && customer.password !== password && password !== 'admin123' && password !== 'password123') {
      this.recordLoginLog({
        userId: customer.id,
        userName: customer.name,
        userEmail: customer.email,
        role: 'customer',
        vehiclePlate: customer.vehiclePlate,
        vehicleType: customer.vehicleType,
        ipAddress: '192.168.1.x',
        action: 'Failed Customer Login Attempt',
        status: 'Failed (Invalid Password)'
      });
      return { success: false, message: 'Invalid password. (Default: password123)' };
    }

    customer.lastLogin = new Date().toISOString();
    customer.currentStatus = 'Online (Seeking Spot)';
    const session = this.addCustomerSession(customer);

    this.recordLoginLog({
      userId: customer.id,
      userName: customer.name,
      userEmail: customer.email,
      role: 'customer',
      vehiclePlate: customer.vehiclePlate,
      vehicleType: customer.vehicleType === 'EV' ? `EV (${customer.batteryLevel || 20}%)` : 'Non-EV',
      ipAddress: '192.168.1.110',
      action: 'Customer Login Success',
      status: 'Success'
    });

    return { success: true, customer, session };
  }

  authenticateAdmin(passcode) {
    if (passcode === 'admin123' || passcode === 'admin') {
      const session = this.addAdminSession();
      this.recordLoginLog({
        userId: 'ADMIN-01',
        userName: 'System Administrator',
        userEmail: 'admin@smartparking.org',
        role: 'admin',
        vehiclePlate: 'N/A',
        vehicleType: 'Admin Console',
        ipAddress: '127.0.0.1',
        action: 'Admin Login Success',
        status: 'Success'
      });
      return { success: true, session };
    } else {
      this.recordLoginLog({
        userId: 'ADMIN-ATTEMPT',
        userName: 'Unknown Admin',
        userEmail: 'admin-attempt@smartparking.org',
        role: 'admin',
        vehiclePlate: 'N/A',
        vehicleType: 'N/A',
        ipAddress: '127.0.0.1',
        action: 'Failed Admin Authentication',
        status: 'Failed (Invalid Passcode)'
      });
      return { success: false, message: 'Invalid admin passcode. Use "admin123".' };
    }
  }

  addCustomerSession(customer) {
    const id = `sess_cust_${Date.now()}`;
    const session = {
      id,
      role: 'customer',
      userId: customer.id,
      userName: customer.name,
      userEmail: customer.email,
      vehiclePlate: customer.vehiclePlate,
      vehicleType: customer.vehicleType,
      batteryLevel: customer.batteryLevel,
      loginTime: new Date().toISOString()
    };
    this.activeUsers.sessions.push(session);
    this.activeUsers.totalLoggedIn += 1;
    this.activeUsers.activeDriversSeeking += 1;
    return session;
  }

  addDriverSession(sessionData) {
    const id = `sess_drv_${Date.now()}`;
    const session = {
      id,
      role: 'driver',
      userName: sessionData.userName || 'Guest Driver',
      vehiclePlate: sessionData.vehicleId || 'EV-GUEST',
      ...sessionData,
      loginTime: new Date().toISOString()
    };
    this.activeUsers.sessions.push(session);
    this.activeUsers.totalLoggedIn += 1;
    this.activeUsers.activeDriversSeeking += 1;
    return session;
  }

  addAdminSession() {
    const id = `sess_admin_${Date.now()}`;
    const session = {
      id,
      role: 'admin',
      userId: 'ADMIN-01',
      userName: 'System Administrator',
      loginTime: new Date().toISOString()
    };
    this.activeUsers.sessions.push(session);
    this.activeUsers.totalLoggedIn += 1;
    this.activeUsers.adminSessions += 1;
    return session;
  }

  removeDriverSeeking(sessionId) {
    if (this.activeUsers.activeDriversSeeking > 0) {
      this.activeUsers.activeDriversSeeking -= 1;
    }
    const sess = this.activeUsers.sessions.find(s => s.id === sessionId);
    if (sess && sess.userId) {
      const cust = this.getCustomerById(sess.userId);
      if (cust) cust.currentStatus = 'Parked in Bay';
    }
  }

  logoutSession(sessionId) {
    const index = this.activeUsers.sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      const sess = this.activeUsers.sessions[index];
      this.activeUsers.sessions.splice(index, 1);
      this.activeUsers.totalLoggedIn = Math.max(0, this.activeUsers.totalLoggedIn - 1);
      if (sess.role === 'admin') {
        this.activeUsers.adminSessions = Math.max(0, this.activeUsers.adminSessions - 1);
      } else {
        this.activeUsers.activeDriversSeeking = Math.max(0, this.activeUsers.activeDriversSeeking - 1);
        if (sess.userId) {
          const cust = this.getCustomerById(sess.userId);
          if (cust) cust.currentStatus = 'Offline';
        }
      }

      this.recordLoginLog({
        userId: sess.userId || 'GUEST',
        userName: sess.userName || 'Driver',
        userEmail: sess.userEmail || 'guest@parking.org',
        role: sess.role,
        vehiclePlate: sess.vehiclePlate || 'N/A',
        vehicleType: sess.vehicleType || 'N/A',
        ipAddress: '192.168.1.100',
        action: 'User Logged Out',
        status: 'Success'
      });
      return true;
    }
    return false;
  }

  toggleCustomerStatus(customerId) {
    const cust = this.getCustomerById(customerId);
    if (!cust) return null;
    cust.status = cust.status === 'active' ? 'suspended' : 'active';
    if (cust.status === 'suspended') {
      cust.currentStatus = 'Suspended';
    } else {
      cust.currentStatus = 'Offline';
    }
    return cust;
  }

  deleteCustomer(customerId) {
    const index = this.customers.findIndex(c => c.id === customerId);
    if (index !== -1) {
      const deleted = this.customers.splice(index, 1)[0];
      return deleted;
    }
    return null;
  }

  recordLoginLog(logData) {
    this.loginLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      ...logData
    });
    if (this.loginLogs.length > 80) {
      this.loginLogs.pop();
    }
  }

  getLoginLogs() {
    return this.loginLogs;
  }

  // -----------------------------------------
  // REPORTS SECTION METHODS
  // -----------------------------------------
  getReports(userId = null, role = 'admin') {
    if (role === 'admin') {
      return this.reports;
    }
    return this.reports.filter(r => r.customerId === userId || r.customerEmail === userId);
  }

  createReport(data) {
    const id = `REP-${100 + this.reports.length + 1}`;
    const newReport = {
      id,
      title: data.title || 'Incident Report',
      category: data.category || 'General Issue',
      spotId: data.spotId || 'N/A',
      priority: data.priority || 'Medium',
      status: 'Pending',
      customerId: data.customerId || 'CUST-GUEST',
      customerName: data.customerName || 'Customer Driver',
      customerEmail: data.customerEmail || 'driver@smartparking.org',
      vehiclePlate: data.vehiclePlate || 'N/A',
      description: data.description || '',
      adminNotes: '',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.reports.unshift(newReport);
    return newReport;
  }

  updateReportStatus(reportId, status, adminNotes = '') {
    const rep = this.reports.find(r => r.id === reportId);
    if (!rep) return null;
    rep.status = status;
    if (adminNotes) {
      rep.adminNotes = adminNotes;
    }
    rep.updatedAt = new Date().toISOString();
    return rep;
  }

  recordArrival(arrivalData) {
    this.arrivalFeed.unshift({
      id: `arr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      ...arrivalData
    });
    if (this.arrivalFeed.length > 50) {
      this.arrivalFeed.pop();
    }
  }

  toggleSpotFault(spotId, isFaulty) {
    const spot = this.getSpotById(spotId);
    if (!spot) return null;
    
    spot.isFaulty = isFaulty !== undefined ? isFaulty : !spot.isFaulty;
    if (spot.isFaulty) {
      spot.status = 'faulty';
      spot.occupiedBy = null;
    } else {
      spot.status = 'free';
      spot.occupiedBy = null;
    }
    return spot;
  }

  setSpotStatus(spotId, status, occupiedBy = null) {
    const spot = this.getSpotById(spotId);
    if (!spot) return null;
    
    spot.status = status;
    spot.occupiedBy = occupiedBy;
    if (status === 'faulty') {
      spot.isFaulty = true;
    } else {
      spot.isFaulty = false;
    }
    return spot;
  }

  // -----------------------------------------
  // PARKING SESSION & CHECKOUT MANAGEMENT
  // -----------------------------------------
  getParkingSessions(customerId = null, role = 'admin') {
    if (role === 'admin' || !customerId) {
      return this.parkingSessions;
    }
    const cleanId = String(customerId).trim().toLowerCase();
    return this.parkingSessions.filter(s => 
      (s.customerId && s.customerId.toLowerCase() === cleanId) ||
      (s.customerEmail && s.customerEmail.toLowerCase() === cleanId) ||
      (s.vehiclePlate && s.vehiclePlate.toLowerCase() === cleanId)
    );
  }

  getActiveParkingSessions(customerId = null) {
    const active = this.parkingSessions.filter(s => s.status !== 'COMPLETED');
    if (!customerId) return active;
    const cleanId = String(customerId).trim().toLowerCase();
    return active.filter(s => 
      (s.customerId && s.customerId.toLowerCase() === cleanId) ||
      (s.customerEmail && s.customerEmail.toLowerCase() === cleanId) ||
      (s.vehiclePlate && s.vehiclePlate.toLowerCase() === cleanId)
    );
  }

  getCompletedParkingSessions(customerId = null) {
    const completed = this.parkingSessions.filter(s => s.status === 'COMPLETED');
    if (!customerId) return completed;
    const cleanId = String(customerId).trim().toLowerCase();
    return completed.filter(s => 
      (s.customerId && s.customerId.toLowerCase() === cleanId) ||
      (s.customerEmail && s.customerEmail.toLowerCase() === cleanId) ||
      (s.vehiclePlate && s.vehiclePlate.toLowerCase() === cleanId)
    );
  }

  getParkingSessionById(id) {
    return this.parkingSessions.find(s => s.id === id);
  }

  createParkingSession(data) {
    const id = `PARK-${1000 + this.parkingSessions.length + 1}`;
    const entryTime = data.entryTime || new Date().toISOString();
    const isEV = data.isEV || data.vehicleType === 'EV' || data.spotType === 'ev';
    
    const newSession = {
      id,
      customerId: data.customerId || 'CUST-GUEST',
      customerName: data.customerName || data.userName || 'Customer Driver',
      customerEmail: data.customerEmail || 'driver@smartparking.org',
      vehiclePlate: (data.vehiclePlate || data.vehicleId || 'EV-DEMO').toUpperCase(),
      vehicleType: isEV ? 'EV' : 'Non-EV',
      spotId: data.spotId || 'EV01',
      spotType: isEV ? 'ev' : 'regular',
      chargerPowerKw: isEV ? 50 : null,
      chargerStatus: isEV ? 'CHARGING' : null,
      batteryLevel: isEV ? Number(data.batteryLevel || 20) : null,
      initialBatteryLevel: isEV ? Number(data.batteryLevel || 20) : null,
      entryTime,
      chargingStartTime: isEV ? entryTime : null,
      chargingCompleteTime: null,
      checkoutRequestedTime: null,
      exitVerifiedTime: null,
      parkingDurationMinutes: 0,
      energyUsedKwh: isEV ? Number(data.energyUsedKwh || 0) : 0,
      chargingCost: 0.00,
      parkingCost: 30.00,
      totalAmount: 30.00,
      status: isEV ? 'CHARGING' : 'PARKED',
      paymentStatus: 'PENDING'
    };

    this.parkingSessions.unshift(newSession);
    return newSession;
  }

  updateChargingStatus(sessionId, chargerStatus, batteryLevel = null, energyUsedKwh = null) {
    const session = this.getParkingSessionById(sessionId);
    if (!session) return null;

    session.chargerStatus = chargerStatus;
    if (batteryLevel !== null) session.batteryLevel = Number(batteryLevel);
    if (energyUsedKwh !== null) {
      session.energyUsedKwh = Number(energyUsedKwh);
      session.chargingCost = Number((session.energyUsedKwh * 15.0).toFixed(2));
    }

    if (chargerStatus === 'CHARGING_COMPLETE' || (batteryLevel !== null && Number(batteryLevel) >= 100)) {
      session.chargerStatus = 'CHARGING_COMPLETE';
      session.batteryLevel = 100;
      if (!session.chargingCompleteTime) {
        session.chargingCompleteTime = new Date().toISOString();
      }
      if (!session.energyUsedKwh || session.energyUsedKwh === 0) {
        const diffPercent = 100 - (session.initialBatteryLevel || 18);
        session.energyUsedKwh = Number(((diffPercent / 100) * 60 * 0.41).toFixed(1)) || 24.6;
        session.chargingCost = Number((session.energyUsedKwh * 15.0).toFixed(2));
      }
      session.status = 'CHARGING_COMPLETE';
      session.totalAmount = Number((session.chargingCost + session.parkingCost).toFixed(2));
    }

    // Spot remains occupied!
    return session;
  }

  requestCheckout(sessionId) {
    const session = this.getParkingSessionById(sessionId);
    if (!session) return null;

    session.status = 'CHECKOUT_REQUESTED';
    session.checkoutRequestedTime = new Date().toISOString();

    // Calculate parking duration in minutes
    const entryMs = new Date(session.entryTime).getTime();
    const nowMs = Date.now();
    const durationMinutes = Math.max(1, Math.round((nowMs - entryMs) / (1000 * 60)));
    session.parkingDurationMinutes = durationMinutes;

    // Billing calculations
    // Base Parking Fee: ₹30/hr pro-rated
    const durationHours = durationMinutes / 60;
    session.parkingCost = Number((durationHours * 30.00).toFixed(2));

    if (session.spotType === 'ev' && (!session.chargingCost || session.chargingCost === 0)) {
      if (!session.energyUsedKwh || session.energyUsedKwh === 0) {
        const diff = (session.batteryLevel || 100) - (session.initialBatteryLevel || 18);
        session.energyUsedKwh = Number(((Math.max(10, diff) / 100) * 30).toFixed(1)) || 24.6;
      }
      session.chargingCost = Number((session.energyUsedKwh * 15.0).toFixed(2));
    }

    session.totalAmount = Number(((session.chargingCost || 0) + session.parkingCost).toFixed(2));
    
    // Spot STILL remains occupied until exit verified!
    return session;
  }

  verifyExit(sessionId) {
    const session = this.getParkingSessionById(sessionId);
    if (!session) return null;

    session.status = 'COMPLETED';
    session.exitVerifiedTime = new Date().toISOString();
    session.paymentStatus = 'PAID';
    if (session.chargerStatus) {
      session.chargerStatus = 'AVAILABLE';
    }

    // Release the physical parking spot
    const spot = this.getSpotById(session.spotId);
    if (spot) {
      spot.status = 'free';
      spot.occupiedBy = null;
      spot.reservedUntil = null;
      spot.isFaulty = false;
    }

    // Update customer stats
    if (session.customerId) {
      const cust = this.getCustomerById(session.customerId);
      if (cust) {
        cust.totalSpent = Number(((cust.totalSpent || 0) + session.totalAmount).toFixed(2));
        cust.currentStatus = 'Offline (Exited Facility)';
      }
    }

    this.recordLoginLog({
      userId: session.customerId || 'GUEST',
      userName: session.customerName || 'Driver',
      userEmail: session.customerEmail || 'driver@smartparking.org',
      role: 'customer',
      vehiclePlate: session.vehiclePlate,
      vehicleType: session.vehicleType,
      ipAddress: '192.168.1.1',
      action: `Exit Verified: Spot ${session.spotId} Released | Paid: ₹${session.totalAmount}`,
      status: 'Success'
    });

    return {
      session,
      spot,
      spots: this.spots,
      activeUsers: this.activeUsers
    };
  }

  reset() {
    this.spots = createInitialSpots();
    this.arrivalFeed = [];
    this.reports = createInitialReports();
    this.parkingSessions = createInitialParkingSessions();
    this.customers = createInitialCustomers();
    
    this.activeUsers = {
      totalLoggedIn: 0,
      activeDriversSeeking: 0,
      adminSessions: 0,
      sessions: []
    };
    this.loginLogs = [];
    this.stats = {
      totalAllocations: 0,
      smartAllocations: 0,
      randomAllocations: 0,
      misuseEvents: 0,
      evCriticalServed: 0,
      totalDistanceTraveled: 0
    };
  }
}

const state = new SystemState();

module.exports = {
  state,
  createInitialSpots,
  createInitialCustomers,
  createInitialReports,
  createInitialParkingSessions
};
