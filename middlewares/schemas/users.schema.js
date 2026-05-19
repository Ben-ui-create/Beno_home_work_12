import Joi from 'joi';

export default {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(32).required(),
  }),

  register: Joi.object({
    name: Joi.string().alphanum().required(),
    age: Joi.number().integer().min(10).max(200).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(32).required(),
  }),

  update: Joi.object({
    name: Joi.string().alphanum().required(),
    age: Joi.number().integer().min(10).max(200).required(),
  }),

  getUsersList: Joi.object({
    page: Joi.number().integer().min(1).max(1000).default(1),
    limit: Joi.number().integer().min(5).max(200).default(20),
  }),
}