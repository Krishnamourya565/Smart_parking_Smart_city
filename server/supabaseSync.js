/**
 * supabaseSync.js
 *
 * Real-time bidirectional database synchronization with Supabase:
 * Updated for Normalized Architecture v2:
 * - parking_bays
 * - profiles
 * - vehicles
 * - parking_sessions
 * - session_events
 * - reports
 */

const { supabase } = require('./supabase');

async function syncSpotToSupabase(spot) {
  if (!supabase || !spot) return;
  try {
    const bayType = spot.type === 'ev' ? 'EV' : 'regular';
    // Sync to parking_bays
    await supabase
      .from('parking_bays')
      .upsert({
        id: spot.id,
        location_id: '00000000-0000-0000-0000-000000000001',
        bay_type: bayType,
        status: spot.isFaulty ? 'faulty' : (spot.status || 'free')
      }, { onConflict: 'id' });

    // Fallback sync to spots table if still queried
    await supabase
      .from('spots')
      .upsert({
        id: spot.id,
        status: spot.isFaulty ? 'faulty' : (spot.status || 'free'),
        is_faulty: spot.isFaulty || false,
        occupied_by: spot.occupiedBy || null,
        reserved_until: spot.reservedUntil || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
  } catch (err) {
    console.error(`[Supabase Sync] Error syncing bay ${spot.id}:`, err.message);
  }
}

async function syncAllSpotsToSupabase(spots) {
  if (!supabase || !Array.isArray(spots) || spots.length === 0) return;
  try {
    const formattedBays = spots.map(s => ({
      id: s.id,
      location_id: '00000000-0000-0000-0000-000000000001',
      bay_type: s.type === 'ev' ? 'EV' : 'regular',
      status: s.isFaulty ? 'faulty' : (s.status || 'free')
    }));

    await supabase
      .from('parking_bays')
      .upsert(formattedBays, { onConflict: 'id' });

    console.log(`[Supabase Sync] Successfully synchronized all ${spots.length} bays to parking_bays.`);
  } catch (err) {
    console.error('[Supabase Sync] Error syncing all bays:', err.message);
  }
}

async function syncCustomerToSupabase(customer) {
  if (!supabase || !customer) return;
  try {
    // 1. Sync to profiles
    const role = customer.role === 'admin' ? 'admin' : 'user';
    await supabase
      .from('profiles')
      .upsert({
        id: customer.id,
        full_name: customer.name || customer.fullName,
        phone: customer.phone || '',
        role: role,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    // 2. Sync to vehicles if plate is present
    if (customer.vehiclePlate) {
      const vType = (customer.vehicleType || '').toUpperCase().includes('EV') ? 'EV' : 'ICE';
      await supabase
        .from('vehicles')
        .upsert({
          owner_id: customer.id,
          plate: customer.vehiclePlate,
          type: vType
        }, { onConflict: 'owner_id' });
    }
  } catch (err) {
    console.error(`[Supabase Sync] Error syncing profile/vehicle for ${customer.id}:`, err.message);
  }
}

async function syncParkingSessionToSupabase(session) {
  if (!supabase || !session) return;
  try {
    let dbStatus = 'en_route';
    const s = (session.status || '').toLowerCase();
    if (s.includes('complete') || session.exitTime) {
      dbStatus = 'completed';
    } else if (s.includes('exit')) {
      dbStatus = 'exiting';
    } else if (s.includes('park') || s.includes('charg')) {
      dbStatus = 'parked';
    } else if (s.includes('route')) {
      dbStatus = 'en_route';
    }

    const userId = session.customerId && session.customerId !== 'CUST-GUEST' ? session.customerId : (session.userId || null);
    const bayId = session.spotId || session.bayId || session.spot_id || session.bay_id || null;

    const { error } = await supabase
      .from('parking_sessions')
      .upsert({
        id: session.id,
        user_id: userId,
        bay_id: bayId,
        status: dbStatus,
        kwh: session.energyDeliveredKWh || session.energyUsedKwh || session.kwh || 0,
        fee: session.amountPaid || session.totalAmount || session.fee || 0,
        created_at: session.entryTime || session.created_at || new Date().toISOString(),
        completed_at: session.exitTime || session.completed_at || null
      }, { onConflict: 'id' });

    if (error) {
      console.error(`[Supabase Sync] Failed to upsert parking_sessions ${session.id}:`, error.message);
    } else {
      // Also log event to session_events
      await supabase.from('session_events').insert({
        session_id: session.id,
        status: dbStatus,
        created_at: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error(`[Supabase Sync] Error syncing parking_sessions ${session.id}:`, err.message);
  }
}

async function syncReportToSupabase(report) {
  if (!supabase || !report) return;
  try {
    const userId = report.customerId || report.userId || null;
    const bayId = report.spotId || report.bayId || null;

    const { error } = await supabase
      .from('reports')
      .upsert({
        id: report.id,
        user_id: userId,
        bay_id: bayId,
        category: report.category || 'General',
        status: report.status || 'Pending',
        description: report.description || report.title || '',
        created_at: report.submittedAt || report.created_at || new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error(`[Supabase Sync] Failed to upsert report ${report.id}:`, error.message);
    }
  } catch (err) {
    console.error(`[Supabase Sync] Error syncing report ${report.id}:`, err.message);
  }
}

module.exports = {
  syncSpotToSupabase,
  syncAllSpotsToSupabase,
  syncCustomerToSupabase,
  syncParkingSessionToSupabase,
  syncReportToSupabase
};
