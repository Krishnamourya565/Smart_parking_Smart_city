-- ====================================================================
-- SMART PARKING — STAR SCHEMA (Data Warehouse Design)
-- Run this in Supabase SQL Editor AFTER the base schema + seed data
-- ====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- DIMENSION 1: dim_customer (Customer Dimension)
-- ─────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS dim_customer CASCADE;
CREATE TABLE dim_customer (
    customer_key    SERIAL PRIMARY KEY,
    customer_id     VARCHAR(20) UNIQUE NOT NULL,
    customer_name   VARCHAR(100) NOT NULL,
    email           VARCHAR(150),
    phone           VARCHAR(30),
    vehicle_plate   VARCHAR(20) NOT NULL,
    vehicle_type    VARCHAR(20) NOT NULL,       -- 'EV' or 'Non-EV'
    battery_level   INT,
    account_status  VARCHAR(20) DEFAULT 'active',
    total_bookings  INT DEFAULT 0,
    total_spent     NUMERIC(10, 2) DEFAULT 0.00,
    registered_at   TIMESTAMPTZ DEFAULT NOW(),
    last_login      TIMESTAMPTZ
);

-- ─────────────────────────────────────────────────────────────────────
-- DIMENSION 2: dim_spot (Parking Spot Dimension)
-- ─────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS dim_spot CASCADE;
CREATE TABLE dim_spot (
    spot_key            SERIAL PRIMARY KEY,
    spot_id             VARCHAR(10) UNIQUE NOT NULL,
    spot_name           VARCHAR(50) NOT NULL,
    spot_type           VARCHAR(20) NOT NULL,    -- 'ev' or 'regular'
    row_number          INT NOT NULL,
    col_number          INT NOT NULL,
    x_coord             FLOAT NOT NULL,
    y_coord             FLOAT NOT NULL,
    distance_from_gate  FLOAT NOT NULL,
    is_ev_charger       BOOLEAN DEFAULT FALSE
);

-- ─────────────────────────────────────────────────────────────────────
-- DIMENSION 3: dim_time (Time Dimension — for analytics & grouping)
-- ─────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS dim_time CASCADE;
CREATE TABLE dim_time (
    time_key        SERIAL PRIMARY KEY,
    full_date       DATE NOT NULL UNIQUE,
    day_of_week     VARCHAR(10),          -- 'Monday', 'Tuesday', etc.
    day_of_month    INT,
    week_of_year    INT,
    month_number    INT,
    month_name      VARCHAR(15),
    quarter         INT,
    year            INT,
    is_weekend      BOOLEAN DEFAULT FALSE
);

-- ─────────────────────────────────────────────────────────────────────
-- DIMENSION 4: dim_vehicle (Vehicle Dimension)
-- ─────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS dim_vehicle CASCADE;
CREATE TABLE dim_vehicle (
    vehicle_key     SERIAL PRIMARY KEY,
    vehicle_plate   VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type    VARCHAR(20) NOT NULL,        -- 'EV' or 'Non-EV'
    is_ev           BOOLEAN DEFAULT FALSE,
    owner_name      VARCHAR(100),
    owner_email     VARCHAR(150)
);

-- ─────────────────────────────────────────────────────────────────────
-- FACT TABLE: fact_parking_sessions (Central Fact Table)
-- Measures: duration, energy consumed, amount paid
-- Foreign keys: customer_key, spot_key, time_key, vehicle_key
-- ─────────────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS fact_parking_sessions CASCADE;
CREATE TABLE fact_parking_sessions (
    session_key         SERIAL PRIMARY KEY,
    session_id          VARCHAR(50) UNIQUE NOT NULL,

    -- Dimension Foreign Keys (the "star" arms)
    customer_key        INT REFERENCES dim_customer(customer_key),
    spot_key            INT REFERENCES dim_spot(spot_key),
    time_key            INT REFERENCES dim_time(time_key),
    vehicle_key         INT REFERENCES dim_vehicle(vehicle_key),

    -- Degenerate Dimensions (IDs kept for traceability)
    customer_id         VARCHAR(20),
    spot_id             VARCHAR(10),
    vehicle_plate       VARCHAR(20),

    -- Measures / Metrics
    entry_time          TIMESTAMPTZ,
    exit_time           TIMESTAMPTZ,
    duration_minutes    INT DEFAULT 0,
    energy_kwh          NUMERIC(6, 2) DEFAULT 0.00,
    amount_paid_inr     NUMERIC(10, 2) DEFAULT 0.00,
    battery_at_entry    INT,
    battery_at_exit     INT,

    -- Session metadata
    session_status      VARCHAR(20) DEFAULT 'active',
    spot_type_used      VARCHAR(20),             -- 'ev' or 'regular'
    is_ev_session       BOOLEAN DEFAULT FALSE
);

-- ─────────────────────────────────────────────────────────────────────
-- DISABLE RLS FOR ALL STAR SCHEMA TABLES
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE dim_customer DISABLE ROW LEVEL SECURITY;
ALTER TABLE dim_spot DISABLE ROW LEVEL SECURITY;
ALTER TABLE dim_time DISABLE ROW LEVEL SECURITY;
ALTER TABLE dim_vehicle DISABLE ROW LEVEL SECURITY;
ALTER TABLE fact_parking_sessions DISABLE ROW LEVEL SECURITY;


-- =====================================================================
-- POPULATE DIMENSION TABLES FROM EXISTING DATA
-- =====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- Populate dim_customer from customers table
-- ─────────────────────────────────────────────────────────────────────
INSERT INTO dim_customer (customer_id, customer_name, email, phone, vehicle_plate, vehicle_type, battery_level, account_status, total_bookings, total_spent, registered_at, last_login)
SELECT id, name, email, phone, vehicle_plate, vehicle_type, battery_level, status, total_bookings, total_spent, registered_at, last_login
FROM customers
ON CONFLICT (customer_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- Populate dim_spot from spots table
-- ─────────────────────────────────────────────────────────────────────
INSERT INTO dim_spot (spot_id, spot_name, spot_type, row_number, col_number, x_coord, y_coord, distance_from_gate, is_ev_charger)
SELECT id, name, type, row, col, x, y, distance_from_gate,
       CASE WHEN type = 'ev' THEN TRUE ELSE FALSE END
FROM spots
ON CONFLICT (spot_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- Populate dim_time — generate dates for last 30 days + next 7 days
-- ─────────────────────────────────────────────────────────────────────
INSERT INTO dim_time (full_date, day_of_week, day_of_month, week_of_year, month_number, month_name, quarter, year, is_weekend)
SELECT
    d::date AS full_date,
    TO_CHAR(d, 'Day')              AS day_of_week,
    EXTRACT(DAY FROM d)::INT       AS day_of_month,
    EXTRACT(WEEK FROM d)::INT      AS week_of_year,
    EXTRACT(MONTH FROM d)::INT     AS month_number,
    TO_CHAR(d, 'Month')            AS month_name,
    EXTRACT(QUARTER FROM d)::INT   AS quarter,
    EXTRACT(YEAR FROM d)::INT      AS year,
    CASE WHEN EXTRACT(ISODOW FROM d) IN (6, 7) THEN TRUE ELSE FALSE END AS is_weekend
FROM generate_series(
    (CURRENT_DATE - INTERVAL '30 days')::date,
    (CURRENT_DATE + INTERVAL '7 days')::date,
    '1 day'::interval
) AS d
ON CONFLICT (full_date) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- Populate dim_vehicle from customers table
-- ─────────────────────────────────────────────────────────────────────
INSERT INTO dim_vehicle (vehicle_plate, vehicle_type, is_ev, owner_name, owner_email)
SELECT vehicle_plate, vehicle_type,
       CASE WHEN vehicle_type = 'EV' THEN TRUE ELSE FALSE END,
       name, email
FROM customers
ON CONFLICT (vehicle_plate) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- Populate fact_parking_sessions from parking_sessions table
-- ─────────────────────────────────────────────────────────────────────
INSERT INTO fact_parking_sessions (
    session_id, customer_key, spot_key, time_key, vehicle_key,
    customer_id, spot_id, vehicle_plate,
    entry_time, exit_time, duration_minutes, energy_kwh, amount_paid_inr,
    battery_at_entry, session_status, spot_type_used, is_ev_session
)
SELECT
    ps.id,
    dc.customer_key,
    ds.spot_key,
    dt.time_key,
    dv.vehicle_key,
    ps.customer_id,
    ps.spot_id,
    ps.vehicle_plate,
    ps.entry_time,
    ps.exit_time,
    ps.duration_minutes,
    ps.energy_kwh,
    ps.amount_paid,
    ps.battery_level,
    ps.status,
    s.type,
    CASE WHEN ps.vehicle_type = 'EV' THEN TRUE ELSE FALSE END
FROM parking_sessions ps
LEFT JOIN dim_customer dc ON ps.customer_id = dc.customer_id
LEFT JOIN dim_spot ds ON ps.spot_id = ds.spot_id
LEFT JOIN dim_time dt ON (ps.entry_time::date) = dt.full_date
LEFT JOIN dim_vehicle dv ON ps.vehicle_plate = dv.vehicle_plate
LEFT JOIN spots s ON ps.spot_id = s.id
ON CONFLICT (session_id) DO NOTHING;


-- =====================================================================
-- USEFUL VIEWS FOR ANALYTICS
-- =====================================================================

-- ─────────────────────────────────────────────────────────────────────
-- VIEW: Customer Details Summary (what you asked for!)
-- ─────────────────────────────────────────────────────────────────────
DROP VIEW IF EXISTS vw_customer_details;
CREATE VIEW vw_customer_details AS
SELECT
    dc.customer_id,
    dc.customer_name,
    dc.email,
    dc.phone,
    dc.vehicle_plate,
    dc.vehicle_type,
    dc.battery_level,
    dc.account_status,
    dc.total_bookings,
    dc.total_spent,
    dc.registered_at,
    COUNT(fps.session_key)                              AS total_sessions,
    COUNT(CASE WHEN fps.session_status = 'active' THEN 1 END)     AS active_sessions,
    COUNT(CASE WHEN fps.session_status = 'completed' THEN 1 END)  AS completed_sessions,
    COALESCE(SUM(fps.duration_minutes), 0)              AS total_parking_minutes,
    COALESCE(SUM(fps.energy_kwh), 0)                    AS total_energy_kwh,
    COALESCE(SUM(fps.amount_paid_inr), 0)               AS total_revenue_inr,
    COALESCE(ROUND(AVG(fps.duration_minutes), 1), 0)    AS avg_session_minutes
FROM dim_customer dc
LEFT JOIN fact_parking_sessions fps ON dc.customer_key = fps.customer_key
GROUP BY dc.customer_key, dc.customer_id, dc.customer_name, dc.email,
         dc.phone, dc.vehicle_plate, dc.vehicle_type, dc.battery_level,
         dc.account_status, dc.total_bookings, dc.total_spent, dc.registered_at
ORDER BY dc.total_spent DESC;

-- ─────────────────────────────────────────────────────────────────────
-- VIEW: Daily Revenue & Usage Summary
-- ─────────────────────────────────────────────────────────────────────
DROP VIEW IF EXISTS vw_daily_summary;
CREATE VIEW vw_daily_summary AS
SELECT
    dt.full_date,
    dt.day_of_week,
    dt.is_weekend,
    COUNT(fps.session_key)                      AS total_sessions,
    COUNT(CASE WHEN fps.is_ev_session THEN 1 END)   AS ev_sessions,
    COUNT(CASE WHEN NOT fps.is_ev_session THEN 1 END) AS non_ev_sessions,
    COALESCE(SUM(fps.amount_paid_inr), 0)       AS daily_revenue_inr,
    COALESCE(SUM(fps.energy_kwh), 0)            AS daily_energy_kwh,
    COALESCE(ROUND(AVG(fps.duration_minutes), 1), 0) AS avg_duration_min
FROM dim_time dt
LEFT JOIN fact_parking_sessions fps ON dt.time_key = fps.time_key
GROUP BY dt.full_date, dt.day_of_week, dt.is_weekend
ORDER BY dt.full_date DESC;

-- ─────────────────────────────────────────────────────────────────────
-- VIEW: Spot Utilization Analysis
-- ─────────────────────────────────────────────────────────────────────
DROP VIEW IF EXISTS vw_spot_utilization;
CREATE VIEW vw_spot_utilization AS
SELECT
    ds.spot_id,
    ds.spot_name,
    ds.spot_type,
    ds.is_ev_charger,
    ds.distance_from_gate,
    COUNT(fps.session_key)                      AS times_used,
    COALESCE(SUM(fps.duration_minutes), 0)      AS total_occupied_minutes,
    COALESCE(SUM(fps.amount_paid_inr), 0)       AS revenue_generated_inr,
    COALESCE(SUM(fps.energy_kwh), 0)            AS total_energy_kwh
FROM dim_spot ds
LEFT JOIN fact_parking_sessions fps ON ds.spot_key = fps.spot_key
GROUP BY ds.spot_key, ds.spot_id, ds.spot_name, ds.spot_type,
         ds.is_ev_charger, ds.distance_from_gate
ORDER BY times_used DESC;


-- =====================================================================
-- QUICK TEST: Run these SELECT queries to see your data!
-- =====================================================================

-- 👉 See all customer details with parking stats
-- SELECT * FROM vw_customer_details;

-- 👉 See daily revenue summary
-- SELECT * FROM vw_daily_summary;

-- 👉 See which spots are used the most
-- SELECT * FROM vw_spot_utilization;

-- 👉 See the full star schema fact table with all dimensions joined
-- SELECT
--     fps.session_id,
--     dc.customer_name,
--     dc.vehicle_type,
--     ds.spot_id,
--     ds.spot_type,
--     dt.full_date,
--     dt.day_of_week,
--     fps.duration_minutes,
--     fps.energy_kwh,
--     fps.amount_paid_inr,
--     fps.session_status
-- FROM fact_parking_sessions fps
-- JOIN dim_customer dc ON fps.customer_key = dc.customer_key
-- JOIN dim_spot ds ON fps.spot_key = ds.spot_key
-- LEFT JOIN dim_time dt ON fps.time_key = dt.time_key
-- ORDER BY fps.entry_time DESC;
