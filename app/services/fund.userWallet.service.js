import { pool } from "../database/config.js"

export const fundUserWallet = async (userId, amount) => {
    const client = await pool.connect();

    if(!amount || Number(amount) <= 0) {
        throw new Error('Invalid funding amount');
    }

    try {
        await client.query('BEGIN');


        // 1. Lock user account & get the user account id
        const userAccountRes = await client.query(`
            SELECT id FROM user_accounts WHERE user_id = $1 FOR UPDATE
        `, [userId]);

        if(userAccountRes.rows.length === 0) {
            throw new Error('User account not found');
        }

        const userAccountId = userAccountRes.rows[0].id;

        // 2. Get system account
        const systemAccountRes = await client.query(`
            SELECT id FROM system_accounts WHERE name = 'System Account'
        `);

        if(systemAccountRes.rows.length === 0) {
            throw new Error('System account not found');
        }

        const systemAccountId = systemAccountRes.rows[0].id;

        // 3. Create transaction
        const txRes = await client.query(`
            INSERT INTO transactions (reference, description) VALUES ($1, $2) RETURNING id
        `, [`fund-${userId}-${Date.now()}`, `Fund user wallet with amount ${amount}`]);

        const transactionId = txRes.rows[0].id;

        // 4. Insert ledger entries
        await client.query(`
            INSERT INTO ledger (transaction_id, entry_type, account_id, amount) 
            VALUES 
                ($1, 'debit', $2, $4), 
                ($1, 'credit', $3, $4)
            `, [transactionId, systemAccountId, userAccountId, amount ]);

        // 5. Update user account balance
        await client.query(`
            UPDATE user_accounts SET current_balance = current_balance + $1 where id = $2
        `, [amount, userAccountId]);

        const updateRes = await client.query(`
            SELECT current_balance FROM user_accounts WHERE id = $1    
        `, [userAccountId]);

        const newBalance = updateRes.rows[0].current_balance;

        // 6. Update system account balance
        await client.query(`
            UPDATE system_accounts 
            SET current_balance = current_balance - $1 WHERE id = $2    
        `, [amount, systemAccountId]);
        
        await client.query('COMMIT');

        return { transactionId, newBalance };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};
