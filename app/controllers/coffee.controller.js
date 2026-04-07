import { createNewCoffee, getAllCoffees, getCoffeeByName } from "../services/create.tables.service.js";
import { buyCoffee } from "../services/purchase.coffee.service.js";

export const handleCreateCoffee = async (req, res) => {
    try {
        const { name, price } = req.body;

        if(!name || !price) {
            return res.status(400).json({ error: 'Name and price are required' });
        }

        await createNewCoffee(name, price);

        return res.status(201).json({ message: 'Coffee created successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const handleBuyCoffee = async (req, res) => {
    try {
        const { userId, coffeeId } = req.body;

        if(!userId || !coffeeId) {
            return res.status(400).json({ error: 'userId and coffeeId are required' });
        }

        const result = await buyCoffee(userId, coffeeId);

        return res.status(200).json({ message: 'Coffee purchased successfully', transactionId: result.transactionId });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const handleGetCoffees = async (_, res) => {
    try {
        const coffees = await getAllCoffees();
        return res.status(200).json({ coffees });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const handleGetCoffeeByName = async (req, res) => {
    try {
        const { name } = req.params;

        if(!name) {
            return res.status(400).json({ error: 'Coffee name is required' });
        }

        const coffee = await getCoffeeByName(name);

        if(!coffee) {
            return res.status(404).json({ error: 'Coffee not found' });
        }

        return res.status(200).json({ coffee });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};