import {Router} from 'express';
import controller from '../controllers/tasks.js';
import validation from '../middlewares/validation.js';
import schema from '../middlewares/schemas/tasks.schema.js';
import auth from '../middlewares/authorization.js';

const router = Router();

router.use(auth);

router.get(
  '/',
  validation(schema.list, 'body'),
  controller.list,
);

router.get(
  '/with-details',
  validation(schema.list, 'body'),
  controller.listWithDetails,
);

router.get(
  '/:id',
  validation(schema.idParam, 'body'),
  controller.getById,
);

router.post(
  '/',
  validation(schema.create, 'body'),
  controller.create,
);

router.put(
  '/:id',
  validation(schema.idParam, 'params'),
  validation(schema.update, 'body'),
  controller.update,
);

router.delete(
  '/:id',
  validation(schema.idParam, 'params'),
  controller.deleteTask,
);

export default router;