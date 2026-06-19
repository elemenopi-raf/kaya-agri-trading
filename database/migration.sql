-- Run against existing database to add new roles, tables, and seed users
INSERT INTO roles (name) VALUES ('MANAGER'), ('CASHIER')
ON CONFLICT (name) DO NOTHING;

-- Fix existing users' password hashes (correct BCrypt for admin123/manager123/cashier123)
UPDATE users SET password_hash = '$2a$12$a126CKamJj.3pyHUtOPU1eYpqIpKy3spFi/pAFvCSnESUWSZa17ty'
WHERE username = 'admin';

-- Create manager user if not exists (password: manager123)
INSERT INTO users (username, password_hash, display_name, email)
SELECT 'manager', '$2a$12$j127XgTF0niIRHgXyI5zlOhmUUFSsgKMggcxcuKO0vHbo6fAEJvdC', 'Manager User', 'manager@kaya.com'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'manager');

-- Fix existing manager password if user was created with wrong hash
UPDATE users SET password_hash = '$2a$12$j127XgTF0niIRHgXyI5zlOhmUUFSsgKMggcxcuKO0vHbo6fAEJvdC'
WHERE username = 'manager';

-- Assign MANAGER + CLERK roles to manager
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'manager' AND r.name IN ('MANAGER', 'CLERK')
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Create cashier user if not exists (password: cashier123)
INSERT INTO users (username, password_hash, display_name, email)
SELECT 'cashier', '$2a$12$O6/0VWJYiazsIz6DFaaVGOJICZ/W.Z0hVROaNd6iuE4j6KyhUx2Ki', 'Cashier User', 'cashier@kaya.com'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'cashier');

-- Fix existing cashier password if user was created with wrong hash
UPDATE users SET password_hash = '$2a$12$O6/0VWJYiazsIz6DFaaVGOJICZ/W.Z0hVROaNd6iuE4j6KyhUx2Ki'
WHERE username = 'cashier';

-- Assign CASHIER role to cashier
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'cashier' AND r.name = 'CASHIER'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Add customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(200),
    address TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add sales tables
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity DECIMAL(12,2) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('CASH', 'TRANSFER', 'GCASH', 'CHECK', 'OTHER')),
    reference_no VARCHAR(100),
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
