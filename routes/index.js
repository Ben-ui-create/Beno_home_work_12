import { Router } from 'express';

import usersRouter from './users.js';
import tasksRouter from './tasks.js';

const router = Router();

router.get('/', (req, res) => {
  res.render('home');
});

router.use('/users', usersRouter);
router.use('/tasks', tasksRouter);

export default router;