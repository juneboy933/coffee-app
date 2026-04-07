import express from 'express';
import { fundUserAccount, handleCreateUser } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', handleCreateUser);
router.post('/fund', fundUserAccount);

export default router;
