import jwt from "jsonwebtoken";
import HttpErrors from "http-errors";
import Users from "../models/users.js";

const { TOKEN_SECRET } = process.env;

export default async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(new HttpErrors(401));
    }

    const token = authHeader
      .replace('Bearer', '')
      .trim();

    const decoded = jwt.verify(
      token,
      TOKEN_SECRET
    );

    req.userId = decoded.userId;

    const user = await Users.findById(req.userId);

    if (!user) {
      return next(new HttpErrors(401));
    }

    next();

  } catch (err) {
    console.log(err);

    return next(new HttpErrors(401));
  }
};