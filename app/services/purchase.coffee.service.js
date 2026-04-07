import { pool } from "../database/config.js";

export const buyCoffee = async (userId, coffeeId) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Get coffee
        const coffeeRes = await client.query(
            `SELECT id, price FROM coffee WHERE id = $1`,
            [coffeeId]
        );

        if (coffeeRes.rows.length === 0) {
            throw new Error('Coffee not found');
        }

        const price = coffeeRes.rows[0].price;

        // 2. Lock user account & get the user account id
        const userAccountRes = await client.query(
            `SELECT id FROM user_accounts WHERE user_id = $1 FOR UPDATE`,
            [userId]
        );

        if (userAccountRes.rows.length === 0) {
            throw new Error('User account not found');
        }

        const userAccountId = userAccountRes.rows[0].id;

        // 3. Get coffee account
        const coffeeAccountRes = await client.query(
            `SELECT id FROM coffee_accounts WHERE coffee_id = $1`,
            [coffeeId]
        );

        if (coffeeAccountRes.rows.length === 0) {
            throw new Error('Coffee account not found');
        }

        const coffeeAccountId = coffeeAccountRes.rows[0].id;

        // 4. Compute balance from ledger
        const balanceRes = await client.query(
            `SELECT COALESCE(
                SUM(CASE WHEN entry_type='credit' THEN amount ELSE 0 END) -
                SUM(CASE WHEN entry_type='debit' THEN amount ELSE 0 END), 0
            ) AS balance
            FROM ledger
            WHERE account_id = $1`,
        [userAccountId]
        );

        const balance = parseFloat(balanceRes.rows[0].balance);

        if (balance < price) {
            throw new Error('Insufficient balance');
        }

        // 5. Create transaction
        const txRes = await client.query(
            `INSERT INTO transactions (reference, description)
             VALUES ($1, $2)
             RETURNING id`,
            [
                `purchase-${userId}-${coffeeId}-${Date.now()}`,
                `User ${userId} bought coffee ${coffeeId}`
            ]
        );

        const transactionId = txRes.rows[0].id;

        // 6. Insert ledger entries (double-entry)
        await client.query(
            `INSERT INTO ledger (transaction_id, account_id, entry_type, amount)
             VALUES 
             ($1, $2, 'debit', $3),
             ($1, $4, 'credit', $3)`,
            [transactionId, userAccountId, price, coffeeAccountId]
        );

        // 7. Update user account balance
        await client.query(
            `
            UPDATE user_accounts 
            SET current_balance = current_balance - $1 WHERE id = $2
            `, [price, userAccountId]
        );

        // 8. Update coffee account balance
        await client.query(`
            UPDATE coffee_accounts 
            SET current_balance = current_balance + $1 WHERE id = $2
             `, [price, coffeeAccountId]    
        );

        await client.query('COMMIT');

        return { success: true, transactionId };

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};