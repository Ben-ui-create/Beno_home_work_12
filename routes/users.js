import { Router } from 'express';

import controller from '../controllers/users.js';

import validation from '../middlewares/validation.js';
import schema from '../middlewares/schemas/users.schema.js';
import authorization from "../middlewares/authorization.js";

const router = Router();

router.post(
  '/login',
  validation(schema.login, 'body'),
  controller.login,
);

router.post(
  '/register',
  validation(schema.register, 'body'),
  controller.register,
);

router.get(
  '/profile',
  authorization,
  controller.profile,
);

router.put(
  '/profile',
  authorization,
  validation(schema.update, 'body'),
  controller.update,
);

router.get(
  '/list',
  authorization,
  validation(schema.getUsersList, 'query'),
  controller.getUsersList,
);

router.get(
  '/login', (req, res) => {
    res.render('login');
  });

router.get(
  '/register', (req, res) => {
    res.render('register');
  });



export default router;