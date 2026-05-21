import {Router} from 'express';
import controller from '../controllers/tasks.js';
import validation from '../middlewares/validation.js';
import schema from '../middlewares/schemas/tasks.schema.js';
import auth from '../middlewares/authorization.js';

const router = Router();

router.get(
  '/',
  auth,
  validation(schema.list, 'query'),
  controller.list,
);

router.get(
  '/with-details',
  auth,
  validation(schema.list, 'body'),
  controller.listWithDetails,
);


router.get(
  '/beno', (req, res) => {
    res.render('tasks');
  });

router.get(
  '/:id',
  auth,
  validation(schema.idParam, 'body'),
  controller.getById,
);

router.post(
  '/',
  auth,
  validation(schema.create, 'body'),
  controller.create,
);

router.put(
  '/:id',
  auth,
  validation(schema.idParam, 'params'),
  validation(schema.update, 'body'),
  controller.update,
);

router.delete(
  '/:id',
  auth,
  validation(schema.idParam, 'params'),
  controller.deleteTask,
);


export default router;