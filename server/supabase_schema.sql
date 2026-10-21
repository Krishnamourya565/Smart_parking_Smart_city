-- ====================================================================
-- SMART PARKING & PRIORITY EV ALLOCATION SYSTEM
-- Supabase PostgreSQL Schema & Initial Seed Data
-- ====================================================================

-- 1. DROP EXISTING TABLES (IF RESETTING)
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS parking_sessions CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS spots CASCADE;

-- 2. CREATE SPOTS TABLE (30 Total: 6 EV Bays, 24 Regular Bays)
CREATE TABLE spots (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('ev', 'regular')),
    row INT NOT NULL,
    col INT NOT NULL,
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    distance_from_gate FLOAT NOT NULL,
    status VARCHAR(20) DEFAULT 'free' CHECK (status IN ('free', 'occupied', 'reserved', 'faulty')),
    is_faulty BOOLEAN DEFAULT FALSE,
    occupied_by JSONB DEFAULT NULL,
    reserved_until TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE CUSTOMERS / DRIVERS TABLE
CREATE TABLE customers (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30),
    password VARCHAR(255) NOT NULL,
    vehicle_plate VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('EV', 'Non-EV')),
    battery_level INT CHECK (battery_level BETWEEN 0 AND 100),
    status VARCHAR(20) DEFAULT 'active',
    total_bookings INT DEFAULT 0,
    total_spent NUMERIC(10, 2) DEFAULT 0.00,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- 4. CREATE PARKING SESSIONS TABLE
CREATE TABLE parking_sessions (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(20) REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(100),
    vehicle_plate VARCHAR(20),
    vehicle_type VARCHAR(20),
    spot_id VARCHAR(10) REFERENCES spots(id) ON DELETE SET NULL,
    battery_level INT,
    entry_time TIMESTAMPTZ DEFAULT NOW(),
    exit_time TIMESTAMPTZ,
    duration_minutes INT DEFAULT 0,
    energy_kwh NUMERIC(6, 2) DEFAULT 0.00,
    amount_paid NUMERIC(10, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled'))
);

-- 5. CREATE REPORTS / COMPLAINTS TABLE
CREATE TABLE reports (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    spot_id VARCHAR(10),
    priority VARCHAR(20) DEFAULT 'Medium',
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
    customer_id VARCHAR(20),
    customer_name VARCHAR(100),
    customer_email VARCHAR(150),
    vehicle_plate VARCHAR(20),
    description TEXT,
    admin_notes TEXT DEFAULT '',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DISABLE ROW LEVEL SECURITY (RLS) & ADD PERMISSIVE POLICIES
-- Allows the Supabase publishable key to read & write freely from backend/frontend
ALTER TABLE spots DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE parking_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;

-- Fallback permissive policies in case RLS is left enabled
DROP POLICY IF EXISTS "Public spots access" ON spots;
CREATE POLICY "Public spots access" ON spots FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public customers access" ON customers;
CREATE POLICY "Public customers access" ON customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public parking_sessions access" ON parking_sessions;
CREATE POLICY "Public parking_sessions access" ON parking_sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public reports access" ON reports;
CREATE POLICY "Public reports access" ON reports FOR ALL USING (true) WITH CHECK (true);

-- 7. INITIALIZE ALL 30 PARKING SPOTS (Layout definition — All free & clean)
INSERT INTO spots (id, name, type, row, col, x, y, distance_from_gate, status) VALUES
-- Row 1: EV Chargers (EV01-EV06) + Regular (R01-R04)
('EV01', 'EV Bay 1', 'ev', 1, 1, 1.5, 1.5, 2.12, 'free'),
('EV02', 'EV Bay 2', 'ev', 1, 2, 3.0, 1.5, 3.35, 'free'),
('EV03', 'EV Bay 3', 'ev', 1, 3, 4.5, 1.5, 4.74, 'free'),
('EV04', 'EV Bay 4', 'ev', 1, 4, 6.0, 1.5, 6.18, 'free'),
('EV05', 'EV Bay 5', 'ev', 1, 5, 7.5, 1.5, 7.65, 'free'),
('EV06', 'EV Bay 6', 'ev', 1, 6, 9.0, 1.5, 9.12, 'free'),
('R01',  'Spot R-01', 'regular', 1, 7, 10.5, 1.5, 10.61, 'free'),
('R02',  'Spot R-02', 'regular', 1, 8, 12.0, 1.5, 12.09, 'free'),
('R03',  'Spot R-03', 'regular', 1, 9, 13.5, 1.5, 13.58, 'free'),
('R04',  'Spot R-04', 'regular', 1, 10, 15.0, 1.5, 15.07, 'free'),

-- Row 2: Regular Spots (R05-R14)
('R05', 'Spot R-05', 'regular', 2, 1, 1.5, 3.5, 3.81, 'free'),
('R06', 'Spot R-06', 'regular', 2, 2, 3.0, 3.5, 4.61, 'free'),
('R07', 'Spot R-07', 'regular', 2, 3, 4.5, 3.5, 5.70, 'free'),
('R08', 'Spot R-08', 'regular', 2, 4, 6.0, 3.5, 6.95, 'free'),
('R09', 'Spot R-09', 'regular', 2, 5, 7.5, 3.5, 8.28, 'free'),
('R10', 'Spot R-10', 'regular', 2, 6, 9.0, 3.5, 9.66, 'free'),
('R11', 'Spot R-11', 'regular', 2, 7, 10.5, 3.5, 11.07, 'free'),
('R12', 'Spot R-12', 'regular', 2, 8, 12.0, 3.5, 12.50, 'free'),
('R13', 'Spot R-13', 'regular', 2, 9, 13.5, 3.5, 13.94, 'free'),
('R14', 'Spot R-14', 'regular', 2, 10, 15.0, 3.5, 15.40, 'free'),

-- Row 3: Regular Spots (R15-R24)
('R15', 'Spot R-15', 'regular', 3, 1, 1.5, 5.5, 5.70, 'free'),
('R16', 'Spot R-16', 'regular', 3, 2, 3.0, 5.5, 6.26, 'free'),
('R17', 'Spot R-17', 'regular', 3, 3, 4.5, 5.5, 7.11, 'free'),
('R18', 'Spot R-18', 'regular', 3, 4, 6.0, 5.5, 8.14, 'free'),
('R19', 'Spot R-19', 'regular', 3, 5, 7.5, 5.5, 9.30, 'free'),
('R20', 'Spot R-20', 'regular', 3, 6, 9.0, 5.5, 10.55, 'free'),
('R21', 'Spot R-21', 'regular', 3, 7, 10.5, 5.5, 11.86, 'free'),
('R22', 'Spot R-22', 'regular', 3, 8, 12.0, 5.5, 13.20, 'free'),
('R23', 'Spot R-23', 'regular', 3, 9, 13.5, 5.5, 14.58, 'free'),
('R24', 'Spot R-24', 'regular', 3, 10, 15.0, 5.5, 15.98, 'free')
ON CONFLICT (id) DO UPDATE SET 
    status = 'free', 
    is_faulty = FALSE, 
    occupied_by = NULL, 
    reserved_until = NULL;

