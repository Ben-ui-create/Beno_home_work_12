import moment from "moment";
import HttpErrors from "http-errors";

import Users from "../models/users.js";

export default {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await Users.findByEmail(email);

      console.log(user)

      if (!user || (user.password !== Users.hashPassword(password))) {
        throw new HttpErrors(401, {
          errors: {
            email: "Invalid email or password",
          }
        });
      }

      const token = Users.encrypt({
        userId: user.id,
        expiresIn: moment().add(2, 'hour').toISOString(),
      });

      delete user.password;

      res.json({
        token,
        user,
      });
    } catch (e) {
      next(e);
    }
  },

  async register(req, res, next) {
    try {
      const { name, email, password, age } = req.body;

      if (await Users.checkEmailUnique(email)) {
        throw new HttpErrors(422, {
          errors: {
            email: 'Email is already in use!',
          },
        });
      }

      const user = await Users.create({
        name,
        email,
        password: Users.hashPassword(password),
        age
      });

      delete user.password;

      res.json({
        message: 'User registered successfully',
        user,
      });
    } catch (e) {
      next(e);
    }
  },

  async profile(req, res, next) {
    try {
      const user = await Users.findById(
        req.userId,
      );

      delete user.password;
      res.json({
        user,
      });
    } catch (e) {
      next(e);
    }
  },

  async update(req, res, next) {
    try {
      const { name, age } = req.body;

      const user = await Users.update(
        req.userId,
        { name, age },
      )

      res.json({
        user,
      })
    } catch (e) {
      next(e);
    }
  },

  async getUsersList(req, res, next) {
    try {
      const data = await Users.getUsersList(
        req.query.page,
        req.query.limit,
      )

      res.json(data)
    } catch (e) {
      next(e);
    }
  }
}