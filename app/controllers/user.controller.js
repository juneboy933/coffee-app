import { createNewUser } from "../services/create.tables.service.js";
import { fundUserWallet } from "../services/fund.userWallet.service.js";

export const handleCreateUser = async (req,res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({ error: 'Email and password are required' });
        }

        await createNewUser(email, password);

        return res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}

export const fundUserAccount = async (req, res) => {
    try {
        const { userId, amount } = req.body;

        if(!userId || !amount) {
            return res.status(400).json({ error: 'userId and amount are required' });
        }

        await fundUserWallet(userId, amount);

        return res.status(200).json({ message: 'User wallet funded successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
