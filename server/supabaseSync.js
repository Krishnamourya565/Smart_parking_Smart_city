/**
 * Supabase Real-Time Synchronization Layer
 * Synchronizes in-memory Smart Parking state with live Supabase PostgreSQL tables.
 */

const { supabase } = require('./supabase');

async function syncSpotToSupabase(spot) {
  if (!supabase || !spot) return;
  try {
    const { error } = await supabase
      .from('spots')
      .update({
        status: spot.status,
        is_faulty: Boolean(spot.isFaulty),
        occupied_by: spot.occupiedBy,
        reserved_until: spot.reservedUntil,
        updated_at: new Date().toISOString()
      })
      .eq('id', spot.id);

    if (error) {
      console.error(`[Supabase Sync] Failed to update spot ${spot.id}:`, error.message);
    }
  } catch (err) {
    console.error(`[Supabase Sync] Error syncing spot ${spot.id}:`, err.message);
  }
}

async function syncCustomerToSupabase(customer) {
  if (!supabase || !customer) return;
  try {
    const { error } = await supabase
      .from('customers')
      .upsert({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        password: customer.password || 'password123',
        vehicle_plate: customer.vehiclePlate,
        vehicle_type: customer.vehicleType,
        battery_level: customer.batteryLevel,
        status: customer.status || 'active',
        total_bookings: customer.totalBookings || 0,
        total_spent: customer.totalSpent || 0,
        last_login: customer.lastLogin || new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error(`[Supabase Sync] Failed to upsert customer ${customer.id}:`, error.message);
    }
  } catch (err) {
    console.error(`[Supabase Sync] Error syncing customer ${customer.id}:`, err.message);
  }
}

async function syncParkingSessionToSupabase(session) {
  if (!supabase || !session) return;
  try {
    let dbStatus = 'active';
    const s = (session.status || '').toLowerCase();
    if (s.includes('complete') || session.exitTime) {
      dbStatus = 'completed';
    } else if (s.includes('cancel')) {
      dbStatus = 'cancelled';
    }

    const { error } = await supabase
      .from('parking_sessions')
      .upsert({
        id: session.id,
        customer_id: session.customerId && session.customerId !== 'CUST-GUEST' ? session.customerId : null,
        customer_name: session.customerName,
        vehicle_plate: session.vehiclePlate,
        vehicle_type: session.vehicleType,
        spot_id: session.spotId,
        battery_level: session.batteryLevel || 20,
        entry_time: session.entryTime || new Date().toISOString(),
        exit_time: session.exitTime || null,
        duration_minutes: session.durationMinutes || session.parkingDurationMinutes || 0,
        energy_kwh: session.energyDeliveredKWh || session.energyUsedKwh || 0,
        amount_paid: session.amountPaid || session.totalAmount || 0,
        status: dbStatus
      }, { onConflict: 'id' });

    if (error) {
      console.error(`[Supabase Sync] Failed to upsert session ${session.id}:`, error.message);
    }
  } catch (err) {
    console.error(`[Supabase Sync] Error syncing session ${session.id}:`, err.message);
  }
}

async function syncReportToSupabase(report) {
  if (!supabase || !report) return;
  try {
    const { error } = await supabase
      .from('reports')
      .upsert({
        id: report.id,
        title: report.title,
        category: report.category,
        spot_id: report.spotId,
        priority: report.priority,
        status: report.status,
        customer_id: report.customerId,
        customer_name: report.customerName,
        customer_email: report.customerEmail,
        vehicle_plate: report.vehiclePlate,
        description: report.description,
        admin_notes: report.adminNotes || '',
        submitted_at: report.submittedAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
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
  syncCustomerToSupabase,
  syncParkingSessionToSupabase,
  syncReportToSupabase
};
