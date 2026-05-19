import _ from 'lodash';
import HttpErrors from 'http-errors';

import Tasks from '../models/tasks.js';

export default {
  async create(req, res, next) {
    try {
      const {title, description, taskDate, details} = req.body;

      const taskCount = await Tasks.countByDate(req.userId, taskDate);

      if (taskDate >= 3) {
        throw new HttpErrors(422, {
          errors: {
            taskDate: 'Maximum 3 hat',
          },
        });
      }

      const task = await Tasks.create({
        userId: req.userId,
        title,
        description,
        taskDate,
        details,
      });

      return res.json({task});
    } catch (e) {
      next(e);
    }
  },

  async list(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await Tasks.getList(req.userId, page, limit);

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async listWithDetails(req, res, next) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await Tasks.getListWithDetails(req.userId, page, limit);

      return res.json(result);
    } catch (e) {
      next(e);
    }
  },

  async getById(req, res, next) {
    try {
      const task = await Tasks.getById(req.params.id, req.userId);

      if (!task) {
        throw new HttpErrors(404, {
          message: 'Task not found',
        });
      }

      return res.json({task});
    } catch (e) {
      next(e);
    }
  },

  async update(req, res, next) {
    try {
      const taskCount = await Tasks.countByDate(req.userId, req.body.taskDate);

      if (taskCount >= 3) {
        throw new HttpErrors(422, {
          errors: {
            taskDate: 'Maximum 3 hat',
          }
        });
      }

      const task = await Tasks.update(req.params.id, req.userId, req.body);

      return res.json({task});
    } catch (e) {
      next(e);
    }
  },

  async deleteTask(req, res, next) {
    try {
      const task = await Tasks.findById(req.params.id, req.userId);

      if (!task) {
        throw new HttpErrors(404, {
          message: 'Task not found',
        });
      }

      await Tasks.deleteTask(req.params.id, req.userId);

      return res.json({
        message: 'Task jnjvac e',
      });
    } catch (e) {
      next(e);
    }
  }
};