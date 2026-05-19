import moment from 'moment';
import HttpErrors from "http-errors";

import Users from '../models/users.js'

export default async (req, res, next) => {
  try {
    console.log('AUTH HIT');
    const token = req.headers?.authorization || null;

    if (!token) {
      next(new HttpErrors(401));
      return;
    }

    const decryptData = Users.decrypt(token);

    if (!decryptData || !decryptData?.userId || !decryptData?.expiresIn) {
      next(new HttpErrors(401));
      return;
    }

    if (moment().isAfter(moment(decryptData.expiresIn))) {
      next(new HttpErrors(401, 'Token expired!'));
      return;
    }

    req.userId = decryptData?.userId;

    const user = await Users.findById(req.userId)

    if (!user) {
      next(new HttpErrors(401));
      return;
    }


    next();
  } catch (err) {
    console.log(err);
    next(new HttpErrors(401));
  }
}