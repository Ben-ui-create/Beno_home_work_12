import Joi from 'joi';

const detailsSchema = Joi.object({
  priority: Joi.string()
    .valid('low', 'medium', 'high')
    .default('medium'),

  location: Joi.string()
    .max(255)
    .allow('', null),

  notes: Joi.string()
    .max(1000)
    .allow('', null),
});

export default {
  create: Joi.object({
    title: Joi.string()
      .min(3)
      .max(255)
      .required(),

    description: Joi.string()
      .max(1000)
      .allow('', null),

    taskDate: Joi.date()
      .iso()
      .required(),

    details: detailsSchema.optional(),
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(255),

    description: Joi.string()
      .max(1000)
      .allow('', null),

    completed: Joi.boolean(),

    taskDate: Joi.date().iso(),

    details: detailsSchema.optional(),
  }).min(1),

  list: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .default(1),

    limit: Joi.number()
      .integer()
      .min(5)
      .max(50)
      .default(10),
  }),

  idParam: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required(),
  }),
};