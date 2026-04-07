import { pool } from "./config.js";

export const initDB = async () => {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    // User table id, email, password, created_at
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`
    );
    
    // Coffee table id, name, description, price, created_at
    await pool.query(`
        CREATE TABLE IF NOT EXISTS coffee(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT,
            price NUMERIC(10, 2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );`
    );
    
    // user account table id, user_id, name, current_balance, created_at
    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_accounts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL DEFAULT 'User Account',
            current_balance NUMERIC(20, 4) NOT NULL DEFAULT 0 CHECK( current_balance >= 0),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`
    );
    
    // Coffee account table id, coffee_id, name, current_balance, created_at
    await pool.query(`
        CREATE TABLE IF NOT EXISTS coffee_accounts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            coffee_id UUID NOT NULL REFERENCES coffee(id) ON DELETE CASCADE,
            name TEXT NOT NULL DEFAULT 'Coffee Account',
            current_balance NUMERIC(20, 4) NOT NULL DEFAULT 0 CHECK( current_balance >= 0),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`
    );

    // System account table id, name
    await pool.query(`
        CREATE TABLE IF NOT EXISTS system_accounts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL UNIQUE,
            current_balance NUMERIC(20, 4) NOT NULL DEFAULT 0 CHECK( current_balance >= 0),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`
    );

    // Insert default system account if not exists
    await pool.query(`
        INSERT INTO system_accounts (name, current_balance) 
        VALUES ('System Account', 10000)
        ON CONFLICT (name) DO NOTHING;
    `);

    // Transaction table id, reference, description, created_at
    await pool.query(`
        CREATE TABLE IF NOT EXISTS transactions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            reference TEXT NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`
    );
    
    // Ledger table id, transaction_id, entry_type, account_id, amount, created_at
    await pool.query(`
        CREATE TABLE IF NOT EXISTS ledger (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
            entry_type TEXT NOT NULL CHECK (entry_type IN ('debit', 'credit')),
            account_id UUID NOT NULL,
            amount NUMERIC(20, 4) NOT NULL CHECK (amount > 0),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`
    );
    
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_coffee_name ON coffee(name)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_accounts_user_id ON user_accounts(user_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_coffee_accounts_coffee_id ON coffee_accounts(coffee_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_ledger_account_id ON ledger(account_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_ledger_transaction_id ON ledger(transaction_id)`);
}
