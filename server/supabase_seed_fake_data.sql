-- ====================================================================
-- SMART PARKING — FAKE DATA SEED
-- Run this AFTER supabase_schema.sql in the Supabase SQL Editor
-- ====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- 1. ADD MORE CUSTOMERS (10 additional drivers)
-- ─────────────────────────────────────────────────────────────────────
INSERT INTO customers (id, name, email, phone, password, vehicle_plate, vehicle_type, battery_level, status, total_bookings, total_spent, registered_at) VALUES
('CUST-1007', 'Ravi Patel',        'ravi.patel@example.com',       '+91 99001 11001', 'password123', 'EV-455-RP',  'EV',     35, 'active',    11, 3120.00, NOW() - INTERVAL '45 days'),
('CUST-1008', 'Ananya Gupta',      'ananya.gupta@example.com',     '+91 99002 22002', 'password123', 'ICE-672-AG', 'Non-EV', NULL, 'active',  17, 1890.00, NOW() - INTERVAL '60 days'),
('CUST-1009', 'James Wilson',      'james.wilson@example.com',     '+91 99003 33003', 'password123', 'EV-811-JW',  'EV',     72, 'active',     6, 2740.00, NOW() - INTERVAL '30 days'),
('CUST-1010', 'Meera Krishnan',    'meera.k@example.com',          '+91 99004 44004', 'password123', 'EV-290-MK',  'EV',      8, 'active',    23, 5680.00, NOW() - INTERVAL '90 days'),
('CUST-1011', 'Tom Bradley',       'tom.bradley@example.com',      '+91 99005 55005', 'password123', 'ICE-334-TB', 'Non-EV', NULL, 'active',   9, 1250.00, NOW() - INTERVAL '20 days'),
('CUST-1012', 'Sneha Reddy',       'sneha.reddy@example.com',      '+91 99006 66006', 'password123', 'EV-178-SR',  'EV',     55, 'active',   14, 4010.00, NOW() - INTERVAL '75 days'),
('CUST-1013', 'Vikram Singh',      'vikram.singh@example.com',     '+91 99007 77007', 'password123', 'ICE-905-VS', 'Non-EV', NULL, 'suspended', 3,  420.00, NOW() - INTERVAL '15 days'),
('CUST-1014', 'Lisa Chen',         'lisa.chen@example.com',        '+91 99008 88008', 'password123', 'EV-563-LC',  'EV',     42, 'active',   20, 6230.00, NOW() - INTERVAL '120 days'),
('CUST-1015', 'Arjun Mehta',       'arjun.mehta@example.com',      '+91 99009 99009', 'password123', 'ICE-247-AM', 'Non-EV', NULL, 'active',  12, 1780.00, NOW() - INTERVAL '50 days'),
('CUST-1016', 'Fatima Shaikh',     'fatima.shaikh@example.com',    '+91 99010 10010', 'password123', 'EV-631-FS',  'EV',     28, 'active',    7, 2950.00, NOW() - INTERVAL '35 days')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- 2. UPDATE SOME SPOTS TO OCCUPIED (simulate real parking lot)
-- ─────────────────────────────────────────────────────────────────────
UPDATE spots SET status = 'occupied', occupied_by = '{"vehicleId":"EV-702-NX","isEV":true,"batteryLevel":18}'::jsonb   WHERE id = 'EV01';
UPDATE spots SET status = 'occupied', occupied_by = '{"vehicleId":"EV-319-PS","isEV":true,"batteryLevel":65}'::jsonb   WHERE id = 'EV03';
UPDATE spots SET status = 'occupied', occupied_by = '{"vehicleId":"EV-290-MK","isEV":true,"batteryLevel":8}'::jsonb    WHERE id = 'EV05';
UPDATE spots SET status = 'occupied', occupied_by = '{"vehicleId":"EV-455-RP","isEV":true,"batteryLevel":35}'::jsonb   WHERE id = 'EV06';
UPDATE spots SET status = 'occupied', occupied_by = '{"vehicleId":"ICE-441-SC","isEV":false}'::jsonb                   WHERE id = 'R02';
UPDATE spots SET status = 'occupied', occupied_by = '{"vehicleId":"ICE-884-DK","isEV":false}'::jsonb                   WHERE id = 'R05';
UPDATE spots SET status = 'occupied', occupied_by = '{"vehicleId":"ICE-672-AG","isEV":false}'::jsonb                   WHERE id = 'R08';
UPDATE spots SET status = 'occupied', occupied_by = '{"vehicleId":"EV-811-JW","isEV":true,"batteryLevel":72}'::jsonb   WHERE id = 'EV02';
UPDATE spots SET status = 'occupied', occupied_by = '{"vehicleId":"ICE-334-TB","isEV":false}'::jsonb                   WHERE id = 'R11';
UPDATE spots SET status = 'reserved', reserved_until = NOW() + INTERVAL '12 minutes',
               occupied_by = '{"vehicleId":"EV-563-LC","isEV":true,"batteryLevel":42}'::jsonb WHERE id = 'EV04';
UPDATE spots SET status = 'faulty', is_faulty = TRUE WHERE id = 'R14';

-- ─────────────────────────────────────────────────────────────────────
-- 3. ADD ACTIVE PARKING SESSIONS (currently parked vehicles)
-- ─────────────────────────────────────────────────────────────────────
INSERT INTO parking_sessions (id, customer_id, customer_name, vehicle_plate, vehicle_type, spot_id, battery_level, entry_time, status) VALUES
('SES-20261005-001', 'CUST-1001', 'Alex Johnson',    'EV-702-NX',  'EV',     'EV01', 18, NOW() - INTERVAL '2 hours 15 minutes', 'active'),
('SES-20261005-002', 'CUST-1003', 'Priya Sharma',    'EV-319-PS',  'EV',     'EV03', 65, NOW() - INTERVAL '1 hour 40 minutes',  'active'),
('SES-20261005-003', 'CUST-1010', 'Meera Krishnan',  'EV-290-MK',  'EV',     'EV05',  8, NOW() - INTERVAL '3 hours 10 minutes', 'active'),
('SES-20261005-004', 'CUST-1007', 'Ravi Patel',      'EV-455-RP',  'EV',     'EV06', 35, NOW() - INTERVAL '45 minutes',         'active'),
('SES-20261005-005', 'CUST-1002', 'Sarah Connor',    'ICE-441-SC', 'Non-EV', 'R02',  NULL, NOW() - INTERVAL '1 hour 20 minutes', 'active'),
('SES-20261005-006', 'CUST-1004', 'David Kim',       'ICE-884-DK', 'Non-EV', 'R05',  NULL, NOW() - INTERVAL '55 minutes',        'active'),
('SES-20261005-007', 'CUST-1008', 'Ananya Gupta',    'ICE-672-AG', 'Non-EV', 'R08',  NULL, NOW() - INTERVAL '30 minutes',        'active'),
('SES-20261005-008', 'CUST-1009', 'James Wilson',    'EV-811-JW',  'EV',     'EV02', 72, NOW() - INTERVAL '1 hour 5 minutes',   'active'),
('SES-20261005-009', 'CUST-1011', 'Tom Bradley',     'ICE-334-TB', 'Non-EV', 'R11',  NULL, NOW() - INTERVAL '25 minutes',        'active')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- 4. ADD COMPLETED PARKING SESSIONS (past history)
-- ─────────────────────────────────────────────────────────────────────
INSERT INTO parking_sessions (id, customer_id, customer_name, vehicle_plate, vehicle_type, spot_id, battery_level, entry_time, exit_time, duration_minutes, energy_kwh, amount_paid, status) VALUES
-- Yesterday
('SES-20261004-001', 'CUST-1001', 'Alex Johnson',    'EV-702-NX',  'EV',     'EV02', 22, NOW() - INTERVAL '1 day 6 hours',  NOW() - INTERVAL '1 day 3 hours',    180, 12.50, 385.00, 'completed'),
('SES-20261004-002', 'CUST-1005', 'Elena Rostova',   'EV-992-ER',  'EV',     'EV04', 12, NOW() - INTERVAL '1 day 8 hours',  NOW() - INTERVAL '1 day 4 hours',    240, 18.20, 520.00, 'completed'),
('SES-20261004-003', 'CUST-1002', 'Sarah Connor',    'ICE-441-SC', 'Non-EV', 'R01',  NULL, NOW() - INTERVAL '1 day 5 hours',  NOW() - INTERVAL '1 day 3 hours 30 minutes', 90, 0.00, 135.00, 'completed'),
('SES-20261004-004', 'CUST-1012', 'Sneha Reddy',     'EV-178-SR',  'EV',     'EV01', 55, NOW() - INTERVAL '1 day 4 hours',  NOW() - INTERVAL '1 day 2 hours',    120,  8.40, 290.00, 'completed'),
('SES-20261004-005', 'CUST-1015', 'Arjun Mehta',     'ICE-247-AM', 'Non-EV', 'R10',  NULL, NOW() - INTERVAL '1 day 2 hours',  NOW() - INTERVAL '1 day 30 minutes', 90, 0.00, 135.00, 'completed'),

-- 2 days ago
('SES-20261003-001', 'CUST-1014', 'Lisa Chen',       'EV-563-LC',  'EV',     'EV03', 42, NOW() - INTERVAL '2 days 7 hours', NOW() - INTERVAL '2 days 4 hours',   180, 14.30, 410.00, 'completed'),
('SES-20261003-002', 'CUST-1004', 'David Kim',       'ICE-884-DK', 'Non-EV', 'R07',  NULL, NOW() - INTERVAL '2 days 3 hours', NOW() - INTERVAL '2 days 1 hour',   120,  0.00, 180.00, 'completed'),
('SES-20261003-003', 'CUST-1007', 'Ravi Patel',      'EV-455-RP',  'EV',     'EV06', 35, NOW() - INTERVAL '2 days 5 hours', NOW() - INTERVAL '2 days 2 hours',   180, 11.80, 365.00, 'completed'),
('SES-20261003-004', 'CUST-1016', 'Fatima Shaikh',   'EV-631-FS',  'EV',     'EV01', 28, NOW() - INTERVAL '2 days 6 hours', NOW() - INTERVAL '2 days 3 hours',   180, 15.60, 445.00, 'completed'),

-- 3 days ago
('SES-20261002-001', 'CUST-1003', 'Priya Sharma',    'EV-319-PS',  'EV',     'EV05', 65, NOW() - INTERVAL '3 days 4 hours', NOW() - INTERVAL '3 days 2 hours',   120,  6.20, 215.00, 'completed'),
('SES-20261002-002', 'CUST-1008', 'Ananya Gupta',    'ICE-672-AG', 'Non-EV', 'R03',  NULL, NOW() - INTERVAL '3 days 3 hours', NOW() - INTERVAL '3 days 1 hour 30 minutes', 90, 0.00, 135.00, 'completed'),
('SES-20261002-003', 'CUST-1011', 'Tom Bradley',     'ICE-334-TB', 'Non-EV', 'R09',  NULL, NOW() - INTERVAL '3 days 2 hours', NOW() - INTERVAL '3 days 45 minutes', 75, 0.00, 112.50, 'completed'),
('SES-20261002-004', 'CUST-1009', 'James Wilson',    'EV-811-JW',  'EV',     'EV02', 72, NOW() - INTERVAL '3 days 5 hours', NOW() - INTERVAL '3 days 3 hours',   120,  5.80, 198.00, 'completed'),

-- 5 days ago
('SES-20260930-001', 'CUST-1010', 'Meera Krishnan',  'EV-290-MK',  'EV',     'EV04',  8, NOW() - INTERVAL '5 days 8 hours', NOW() - INTERVAL '5 days 3 hours',   300, 24.50, 720.00, 'completed'),
('SES-20260930-002', 'CUST-1005', 'Elena Rostova',   'EV-992-ER',  'EV',     'EV01', 12, NOW() - INTERVAL '5 days 6 hours', NOW() - INTERVAL '5 days 2 hours',   240, 19.80, 560.00, 'completed'),
('SES-20260930-003', 'CUST-1006', 'Marcus Vance',    'ICE-102-MV', 'Non-EV', 'R04',  NULL, NOW() - INTERVAL '5 days 2 hours', NOW() - INTERVAL '5 days 1 hour',    60,  0.00,  90.00, 'completed')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- 5. ADD MORE REPORTS / COMPLAINTS
-- ─────────────────────────────────────────────────────────────────────
INSERT INTO reports (id, title, category, spot_id, priority, status, customer_id, customer_name, customer_email, vehicle_plate, description, admin_notes, submitted_at) VALUES
('REP-104', 'Slow Charging Speed at EV06',            'EV Charger Fault',       'EV06', 'High',     'In Progress', 'CUST-1007', 'Ravi Patel',      'ravi.patel@example.com',    'EV-455-RP',  'Charger at EV06 delivering only 7kW instead of rated 50kW. Charging session taking 4x longer than expected.', 'Firmware update scheduled. Temporary rate cap detected in logs.',  NOW() - INTERVAL '2 days'),
('REP-105', 'Parking Sensor Not Detecting Vehicle',    'Sensor Malfunction',     'R14',  'Critical', 'Pending',     'CUST-1008', 'Ananya Gupta',    'ananya.gupta@example.com',  'ICE-672-AG', 'Spot R14 sensor shows "free" even though my car is parked there. Gate barrier almost hit the next car.',      '',  NOW() - INTERVAL '1 day'),
('REP-106', 'Request for Monthly Parking Pass',        'Billing & Payment',      NULL,   'Low',      'Resolved',    'CUST-1014', 'Lisa Chen',       'lisa.chen@example.com',     'EV-563-LC',  'Would like to know if monthly subscription plans are available for EV charging bays. Currently visiting 4-5 times per week.', 'Forwarded to commercial team. Monthly pass pilot launching next quarter at ₹4,999/month for EV bays.',  NOW() - INTERVAL '5 days'),
('REP-107', 'Water Leakage Near EV03 Charger',         'Safety Hazard',          'EV03', 'Critical', 'In Progress', 'CUST-1003', 'Priya Sharma',    'priya.sharma@example.com',  'EV-319-PS',  'Puddle of water forming near the EV03 charging station cable tray after rain. Electrical safety concern.',     'Maintenance team dispatched. Temporary barrier placed. Drainage inspection underway.',  NOW() - INTERVAL '12 hours'),
('REP-108', 'App Showed Wrong Spot Availability',      'App / Software Bug',     'R08',  'Medium',   'Pending',     'CUST-1011', 'Tom Bradley',     'tom.bradley@example.com',   'ICE-334-TB', 'App showed R08 as available but when I arrived it was occupied. Had to circle around and park at R11 instead.', '',  NOW() - INTERVAL '6 hours'),
('REP-109', 'Overcharged for 2-Hour EV Session',       'Billing & Payment',      'EV01', 'High',     'Resolved',    'CUST-1012', 'Sneha Reddy',     'sneha.reddy@example.com',   'EV-178-SR',  'Billed ₹520 for a 2-hour session but standard rate should be ₹290. Possible double energy meter reading.',    'Billing error confirmed — duplicate kWh log entry. Refund of ₹230 processed to wallet.',  NOW() - INTERVAL '3 days'),
('REP-110', 'Unauthorized Vehicle in Reserved Spot',   'Wrong Parking / Misuse', 'EV04', 'High',     'Pending',     'CUST-1016', 'Fatima Shaikh',   'fatima.shaikh@example.com', 'EV-631-FS',  'My reserved EV04 bay was occupied by an unregistered vehicle when I arrived. Had to wait 20 minutes.', '',  NOW() - INTERVAL '4 hours')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- DONE! Your database is now populated with realistic data.
-- ─────────────────────────────────────────────────────────────────────
