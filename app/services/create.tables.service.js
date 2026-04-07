import { pool } from "../database/config.js";

// Create new user and associated user account
export const createNewUser = async (email, password) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // create new user and get the generated id
        const userRes = await client.query(`
            INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id
            `, [email, password]);
        
        const userId = userRes.rows[0].id;

        // create associated user account with the generated user id
        const userAccountRes = await client.query(`
            INSERT INTO user_accounts (user_id) VALUES ($1) RETURNING id
            `, [userId]);

        const accountId = userAccountRes.rows[0].id;

        await client.query('COMMIT');

        return { userId, accountId };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Create new coffee and associated coffee account
export const createNewCoffee = async (name, price) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // create new coffee and get the generated id
        const coffeeRes = await client.query(`
            INSERT INTO coffee (name, price) VALUES ($1, $2) RETURNING id
            `, [name, price]);

        const coffeeId = coffeeRes.rows[0].id;

        // create associated coffee account with the generated coffee id
        const coffeeAccountRes = await client.query(`
            INSERT INTO coffee_accounts (coffee_id) VALUES ($1) RETURNING id
            `, [coffeeId]);

        const accountId = coffeeAccountRes.rows[0].id;

        await client.query('COMMIT');

        return { coffeeId, accountId };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Get all coffees
export const getAllCoffees = async () => {
    try {
        const res = await pool.query(`
            SELECT id, name, price FROM coffee ORDER BY created_at DESC    
        `)
        return res.rows;
    } catch (error) {
        throw error;
    }
};

// Get coffee by name
export const getCoffeeByName = async (name) => {
    try {
        const res = await getAllCoffees();
        const coffee = res.find(c => c.name.toLowerCase() === name.toLowerCase());
        return coffee || null;
    } catch (error) {
        throw error;
    }
};

