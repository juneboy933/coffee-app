import express from 'express';
import { handleBuyCoffee, handleCreateCoffee, handleGetCoffeeByName, handleGetCoffees } from '../controllers/coffee.controller.js';

const router = express.Router();

router.post('/create', handleCreateCoffee);
router.post('/buy', handleBuyCoffee);
router.get('/all', handleGetCoffees);
router.get('/:name', handleGetCoffeeByName);

export default router;