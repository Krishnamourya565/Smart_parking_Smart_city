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
  return [
    {
      id: 'CUST-1001',
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      phone: '+91 98765 43210',
      password: 'password123',
      vehiclePlate: 'EV-702-NX',
      vehicleType: 'EV',
      batteryLevel: 18, // Critical EV demand
      registeredAt: '2026-08-15T09:30:00.000Z',
      status: 'active',
      totalBookings: 14,
      totalSpent: 4250.00,
      lastLogin: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      currentStatus: 'Seeking Spot'
    },
    {
      id: 'CUST-1002',
      name: 'Sarah Connor',
      email: 'sarah.c@example.com',
      phone: '+91 98123 45678',
      password: 'password123',
      vehiclePlate: 'ICE-441-SC',
      vehicleType: 'Non-EV',
      batteryLevel: null,
      registeredAt: '2026-08-18T14:20:00.000Z',
      status: 'active',
      totalBookings: 22,
      totalSpent: 2850.00,
      lastLogin: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      currentStatus: 'Seeking Spot'
    },
    {
      id: 'CUST-1003',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 98345 67890',
      password: 'password123',
      vehiclePlate: 'EV-319-PS',
      vehicleType: 'EV',
      batteryLevel: 65, // Normal EV demand
      registeredAt: '2026-08-22T11:15:00.000Z',
      status: 'active',
      totalBookings: 8,
      totalSpent: 3650.00,
      lastLogin: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      currentStatus: 'Offline'
    },
    {
      id: 'CUST-1004',
      name: 'David Kim',
      email: 'david.kim@example.com',
      phone: '+91 98456 78901',
      password: 'password123',
      vehiclePlate: 'ICE-884-DK',
      vehicleType: 'Non-EV',
      batteryLevel: null,
      registeredAt: '2026-08-25T16:40:00.000Z',
      status: 'active',
      totalBookings: 19,
      totalSpent: 2940.00,
      lastLogin: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      currentStatus: 'Offline'
    },
    {
      id: 'CUST-1005',
      name: 'Elena Rostova',
      email: 'elena.rostova@example.com',
      phone: '+91 98567 89012',
      password: 'password123',
      vehiclePlate: 'EV-992-ER',
      vehicleType: 'EV',
      batteryLevel: 12, // Critical EV demand
      registeredAt: '2026-08-28T08:50:00.000Z',
      status: 'active',
      totalBookings: 5,
      totalSpent: 4180.00,
      lastLogin: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      currentStatus: 'Offline'
    },
    {
      id: 'CUST-1006',
      name: 'Marcus Vance',
      email: 'marcus.v@example.com',
      phone: '+91 98678 90123',
      password: 'password123',
      vehiclePlate: 'ICE-102-MV',
      vehicleType: 'Non-EV',
      batteryLevel: null,
      registeredAt: '2026-09-01T10:00:00.000Z',
      status: 'suspended',
      totalBookings: 2,
      totalSpent: 580.00,
      lastLogin: new Date(Date.now() - 1000 * 60 * 1400).toISOString(),
      currentStatus: 'Suspended'
    }
  ];
}

function createInitialReports() {
  return [
    {
      id: 'REP-101',
      title: 'Charger Cable Display Glitch at EV02',
      category: 'EV Charger Fault',
      spotId: 'EV02',
      priority: 'High',
      status: 'In Progress', // 'Pending' | 'In Progress' | 'Resolved'
      customerId: 'CUST-1001',
      customerName: 'Alex Johnson',
      customerEmail: 'alex.johnson@example.com',
      vehiclePlate: 'EV-702-NX',
      description: 'The 50kW fast charger display at EV02 showed connection timeout when plugging in.',
      adminNotes: 'Relay diagnostics run remotely; technician inspecting physical connector.',
      submittedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: 'REP-102',
      title: 'Standard Car Parked in Dedicated EV Bay EV05',
      category: 'Wrong Parking / Misuse',
      spotId: 'EV05',
      priority: 'Critical',
      status: 'Resolved',
      customerId: 'CUST-1005',
      customerName: 'Elena Rostova',
      customerEmail: 'elena.rostova@example.com',
      vehiclePlate: 'EV-992-ER',
      description: 'A non-EV vehicle was occupying charging bay EV05 while my battery was at 12%.',
      adminNotes: 'Warden dispatched to reroute ICE vehicle to Row 2 regular spot R08. EV05 is now free.',
      submittedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
    },
    {
      id: 'REP-103',
      title: 'Automated Billing Receipt Question',
      category: 'Billing & Payment',
      spotId: 'EV01',
      priority: 'Low',
      status: 'Pending',
      customerId: 'CUST-1003',
      customerName: 'Priya Sharma',
      customerEmail: 'priya.sharma@example.com',
      vehiclePlate: 'EV-319-PS',
      description: 'Requesting breakdown of energy kWh rate vs dwell time fee for last Tuesday invoice.',
      adminNotes: '',
      submittedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString()
    }
  ];
}

function createInitialParkingSessions() {
  return [
    {
      id: 'PARK-1024',
      customerId: 'CUST-1001',
      customerName: 'Alex Johnson',
      customerEmail: 'alex.johnson@example.com',
      vehiclePlate: 'EV-702-NX',
      vehicleType: 'EV',
      spotId: 'EV02',
      spotType: 'ev',
      chargerPowerKw: 50,
      chargerStatus: 'CHARGING_COMPLETE', // 'AVAILABLE' | 'RESERVED' | 'CONNECTED' | 'CHARGING' | 'CHARGING_COMPLETE' | 'CHECKOUT_REQUESTED' | 'APPROACHING_EXIT' | 'EXIT_VERIFIED' | 'COMPLETED'
      batteryLevel: 100,
      initialBatteryLevel: 18,
      entryTime: new Date(Date.now() - 1000 * 60 * 135).toISOString(), // 2h 15m ago (2.25 hours)
      chargingStartTime: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
      chargingCompleteTime: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      checkoutRequestedTime: null,
      exitVerifiedTime: null,
      parkingDurationMinutes: 135,
      energyUsedKwh: 24.6,
      chargingCost: 369.00, // 24.6 kWh × ₹15.00/kWh = ₹369.00
      parkingCost: 67.50,   // 2.25 hr × ₹30.00/hr = ₹67.50
      totalAmount: 436.50,  // ₹369.00 + ₹67.50 = ₹436.50
      status: 'CHARGING_COMPLETE',
      paymentStatus: 'PENDING'
    },
    {
      id: 'PARK-1020',
      customerId: 'CUST-1003',
      customerName: 'Priya Sharma',
      customerEmail: 'priya.sharma@example.com',
      vehiclePlate: 'EV-319-PS',
      vehicleType: 'EV',
      spotId: 'EV01',
      spotType: 'ev',
      chargerPowerKw: 50,
      chargerStatus: 'COMPLETED',
      batteryLevel: 90,
      initialBatteryLevel: 25,
      entryTime: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      chargingStartTime: new Date(Date.now() - 1000 * 60 * 235).toISOString(),
      chargingCompleteTime: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      checkoutRequestedTime: new Date(Date.now() - 1000 * 60 * 125).toISOString(),
      exitVerifiedTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      parkingDurationMinutes: 120, // 2 hours
      energyUsedKwh: 32.5,
      chargingCost: 487.50, // 32.5 kWh × ₹15.00/kWh = ₹487.50
      parkingCost: 60.00,   // 2.0 hr × ₹30.00/hr = ₹60.00
      totalAmount: 547.50,  // ₹487.50 + ₹60.00 = ₹547.50
      status: 'COMPLETED',
      paymentStatus: 'PAID'
    },
    {
      id: 'PARK-1018',
      customerId: 'CUST-1002',
      customerName: 'Sarah Connor',
      customerEmail: 'sarah.c@example.com',
      vehiclePlate: 'ICE-441-SC',
      vehicleType: 'Non-EV',
      spotId: 'R14',
      spotType: 'regular',
      chargerPowerKw: null,
      chargerStatus: null,
      batteryLevel: null,
      initialBatteryLevel: null,
      entryTime: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
      chargingStartTime: null,
      chargingCompleteTime: null,
      checkoutRequestedTime: new Date(Date.now() - 1000 * 60 * 185).toISOString(),
      exitVerifiedTime: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      parkingDurationMinutes: 180, // 3 hours
      energyUsedKwh: 0,
      chargingCost: 0.00,
      parkingCost: 90.00, // 3.0 hr × ₹30.00/hr = ₹90.00
      totalAmount: 90.00, // ₹90.00
      status: 'COMPLETED',
      paymentStatus: 'PAID'
    }
  ];
}

class SystemState {
  constructor() {
    this.spots = createInitialSpots();
    this.customers = createInitialCustomers();
    this.reports = createInitialReports();
    this.parkingSessions = createInitialParkingSessions();

    // Set initial spot EV02 as occupied by Alex Johnson's active session
    const ev02Spot = this.spots.find(s => s.id === 'EV02');
    if (ev02Spot) {
      ev02Spot.status = 'occupied';
      ev02Spot.occupiedBy = {
        vehicleId: 'EV-702-NX',
        customerId: 'CUST-1001',
        isEV: true,
        batteryLevel: 100,
        sessionId: 'PARK-1024',
        arrivedAt: new Date(Date.now() - 1000 * 60 * 135).toISOString()
      };
    }
    
    this.activeUsers = {
      totalLoggedIn: 3,
      activeDriversSeeking: 2,
      adminSessions: 1,
      sessions: [
        { id: 'sess_admin_1', role: 'admin', userId: 'ADMIN-01', userName: 'System Admin', loginTime: new Date().toISOString() },
        { id: 'sess_drv_101', role: 'customer', userId: 'CUST-1001', userName: 'Alex Johnson', vehicleType: 'EV', vehiclePlate: 'EV-702-NX', batteryLevel: 100, loginTime: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
        { id: 'sess_drv_102', role: 'customer', userId: 'CUST-1002', userName: 'Sarah Connor', vehicleType: 'Non-EV', vehiclePlate: 'ICE-441-SC', batteryLevel: null, loginTime: new Date(Date.now() - 1000 * 60 * 45).toISOString() }
      ]
    };

    this.loginLogs = [
      {
        id: 'LOG-101',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        userId: 'CUST-1002',
        userName: 'Sarah Connor',
        userEmail: 'sarah.c@example.com',
        role: 'customer',
        vehiclePlate: 'ICE-441-SC',
        vehicleType: 'Non-EV',
        ipAddress: '192.168.1.104',
        action: 'Customer Login',
        status: 'Success'
      },
      {
        id: 'LOG-102',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        userId: 'CUST-1001',
        userName: 'Alex Johnson',
        userEmail: 'alex.johnson@example.com',
        role: 'customer',
        vehiclePlate: 'EV-702-NX',
        vehicleType: 'EV (18% Battery)',
        ipAddress: '192.168.1.102',
        action: 'Customer Login & Spot Request',
        status: 'Success'
      },
      {
        id: 'LOG-103',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        userId: 'ADMIN-01',
        userName: 'System Administrator',
        userEmail: 'admin@smartparking.org',
        role: 'admin',
        vehiclePlate: 'N/A',
        vehicleType: 'Admin Console',
        ipAddress: '127.0.0.1',
        action: 'Admin Authentication',
        status: 'Success'
      }
    ];

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
    
    const ev02Spot = this.spots.find(s => s.id === 'EV02');
    if (ev02Spot) {
      ev02Spot.status = 'occupied';
      ev02Spot.occupiedBy = {
        vehicleId: 'EV-702-NX',
        customerId: 'CUST-1001',
        isEV: true,
        batteryLevel: 100,
        sessionId: 'PARK-1024',
        arrivedAt: new Date(Date.now() - 1000 * 60 * 135).toISOString()
      };
    }

    this.activeUsers = {
      totalLoggedIn: 3,
      activeDriversSeeking: 2,
      adminSessions: 1,
      sessions: [
        { id: 'sess_admin_1', role: 'admin', userId: 'ADMIN-01', userName: 'System Administrator', loginTime: new Date().toISOString() },
        { id: 'sess_drv_101', role: 'customer', userId: 'CUST-1001', userName: 'Alex Johnson', vehicleType: 'EV', vehiclePlate: 'EV-702-NX', batteryLevel: 100, loginTime: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
        { id: 'sess_drv_102', role: 'customer', userId: 'CUST-1002', userName: 'Sarah Connor', vehicleType: 'Non-EV', vehiclePlate: 'ICE-441-SC', batteryLevel: null, loginTime: new Date(Date.now() - 1000 * 60 * 45).toISOString() }
      ]
    };
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
