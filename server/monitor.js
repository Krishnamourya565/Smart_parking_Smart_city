/**
 * Real-Time Supabase Runtime Monitor
 * Monitors live changes from Vercel runtime into Supabase tables:
 * - spots
 * - customers
 * - parking_sessions
 * - reports
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ubgivwmkclvzqnrkyapr.supabase.co';
const REST_URL = `${SUPABASE_URL}/rest/v1`;
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_AwukzzZx8wzU0HKsSBGYwQ_Qh4yBHVJ';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'count=exact'
};

async function fetchTable(table, query = 'select=*') {
  try {
    const res = await fetch(`${REST_URL}/${table}?${query}`, { headers });
    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, status: res.status, error: errText, data: [] };
    }
    const data = await res.json();
    const contentRange = res.headers.get('content-range');
    const total = contentRange ? parseInt(contentRange.split('/')[1] || data.length, 10) : data.length;
    return { ok: true, status: res.status, total, data };
  } catch (err) {
    return { ok: false, error: err.message, data: [] };
  }
}

async function checkRLS() {
  // Test if write access is allowed or blocked by RLS
  try {
    const testSpot = {
      id: 'EV01',
      name: 'EV Bay 1',
      type: 'ev',
      row: 1,
      col: 1,
      x: 1.5,
      y: 1.5,
      distance_from_gate: 2.12,
      status: 'free',
      is_faulty: false,
      occupied_by: null,
      reserved_until: null
    };

    const res = await fetch(`${REST_URL}/spots`, {
      method: 'POST',
      headers: {
        ...headers,
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(testSpot)
    });

    if (res.status === 401 || res.status === 403) {
      const text = await res.text();
      if (text.includes('violates row-level security policy') || text.includes('42501')) {
        return {
          allowed: false,
          reason: 'RLS_ACTIVE_BLOCKING_WRITES',
          message: 'Row Level Security is blocking writes from the publishable key. Run the SQL script in Supabase SQL Editor.'
        };
      }
    }
    return { allowed: true };
  } catch (e) {
    return { allowed: false, reason: e.message };
  }
}

let lastState = {
  customerIds: new Set(),
  sessionIds: new Set(),
  reportIds: new Set(),
  occupiedSpots: new Map()
};

let isFirstRun = true;

async function runCheck() {
  const timestamp = new Date().toLocaleTimeString();

  const [spotsRes, custRes, sessRes, repRes] = await Promise.all([
    fetchTable('spots'),
    fetchTable('customers'),
    fetchTable('parking_sessions', 'order=entry_time.desc'),
    fetchTable('reports', 'order=submitted_at.desc')
  ]);

  if (!spotsRes.ok && spotsRes.error.includes('does not exist')) {
    console.log(`[${timestamp}] ⚠️ Tables do not exist yet in Supabase.`);
    return;
  }

  const spots = spotsRes.data || [];
  const customers = custRes.data || [];
  const sessions = sessRes.data || [];
  const reports = repRes.data || [];

  const occupied = spots.filter(s => s.status === 'occupied' || s.status === 'reserved');
  const faulty = spots.filter(s => s.status === 'faulty' || s.is_faulty);

  if (isFirstRun) {
    console.log('\n=============================================================');
    console.log('📡 SUPABASE LIVE RUNTIME MONITOR STARTED');
    console.log(`   Connected to: ${SUPABASE_URL}`);
    console.log('=============================================================');

    const rls = await checkRLS();
    if (!rls.allowed && rls.reason === 'RLS_ACTIVE_BLOCKING_WRITES') {
      console.log('\n⚠️  ACTION REQUIRED IN SUPABASE:');
      console.log('   Row-Level Security (RLS) is currently preventing runtime writes!');
      console.log('   Please run this 1-line command in your Supabase SQL Editor:');
      console.log('   ----------------------------------------------------------');
      console.log('   ALTER TABLE spots DISABLE ROW LEVEL SECURITY;');
      console.log('   ALTER TABLE customers DISABLE ROW LEVEL SECURITY;');
      console.log('   ALTER TABLE parking_sessions DISABLE ROW LEVEL SECURITY;');
      console.log('   ALTER TABLE reports DISABLE ROW LEVEL SECURITY;');
      console.log('   ----------------------------------------------------------\n');
    } else {
      console.log('✅ Write permissions verified (RLS is configured).');
    }

    console.log(`📊 Current Baseline Database State:`);
    console.log(`   • Spots: ${spots.length} total (${occupied.length} occupied/reserved, ${faulty.length} faulty, ${spots.length - occupied.length - faulty.length} free)`);
    console.log(`   • Registered Customers: ${customers.length}`);
    console.log(`   • Parking Sessions: ${sessions.length}`);
    console.log(`   • Incident Reports: ${reports.length}`);
    console.log('-------------------------------------------------------------');
    console.log('👀 Listening for live runtime events from Vercel...\n');

    // Populate initial tracking sets
    customers.forEach(c => lastState.customerIds.add(c.id));
    sessions.forEach(s => lastState.sessionIds.add(s.id));
    reports.forEach(r => lastState.reportIds.add(r.id));
    spots.forEach(s => lastState.occupiedSpots.set(s.id, s.status));

    isFirstRun = false;
    return;
  }

  // Detect New Customers
  customers.forEach(c => {
    if (!lastState.customerIds.has(c.id)) {
      lastState.customerIds.add(c.id);
      console.log(`\n🟢 [${timestamp}] [NEW CUSTOMER REGISTERED]`);
      console.log(`   • ID: ${c.id}`);
      console.log(`   • Name: ${c.name}`);
      console.log(`   • Vehicle Plate: ${c.vehicle_plate} (${c.vehicle_type})`);
      console.log(`   • Email: ${c.email}`);
    }
  });

  // Detect New Parking Sessions
  sessions.forEach(s => {
    if (!lastState.sessionIds.has(s.id)) {
      lastState.sessionIds.add(s.id);
      console.log(`\n🚗 [${timestamp}] [NEW VEHICLE ARRIVAL / PARKING SESSION]`);
      console.log(`   • Session: ${s.id}`);
      console.log(`   • Spot: ${s.spot_id}`);
      console.log(`   • Vehicle: ${s.vehicle_plate} (${s.vehicle_type}, Battery: ${s.battery_level}%)`);
      console.log(`   • Driver: ${s.customer_name || 'Guest'}`);
      console.log(`   • Entry Time: ${s.entry_time}`);
    }
  });

  // Detect Spot Changes (Occupied / Released / Faulty)
  spots.forEach(s => {
    const prevStatus = lastState.occupiedSpots.get(s.id);
    if (prevStatus && prevStatus !== s.status) {
      console.log(`\n🅿️ [${timestamp}] [PARKING SPOT STATUS CHANGE]`);
      console.log(`   • Spot: ${s.id} (${s.name})`);
      console.log(`   • Status: ${prevStatus.toUpperCase()} ➔ ${s.status.toUpperCase()}`);
      if (s.occupied_by) {
        console.log(`   • Occupied By: ${JSON.stringify(s.occupied_by)}`);
      }
    }
    lastState.occupiedSpots.set(s.id, s.status);
  });

  // Detect New Reports
  reports.forEach(r => {
    if (!lastState.reportIds.has(r.id)) {
      lastState.reportIds.add(r.id);
      console.log(`\n⚠️ [${timestamp}] [NEW INCIDENT REPORT FILED]`);
      console.log(`   • ID: ${r.id} | Spot: ${r.spot_id || 'N/A'}`);
      console.log(`   • Title: ${r.title}`);
      console.log(`   • Category: ${r.category} | Priority: ${r.priority}`);
      console.log(`   • Submitter: ${r.customer_name} (${r.vehicle_plate})`);
    }
  });
}

const isWatchMode = process.argv.includes('--watch') || process.argv.includes('-w');

async function main() {
  await runCheck();

  if (isWatchMode) {
    setInterval(runCheck, 3000);
  } else {
    console.log('(Tip: run with `node monitor.js --watch` to keep monitoring continuously)');
  }
}

main();
