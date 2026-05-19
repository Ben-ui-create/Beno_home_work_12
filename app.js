import 'dotenv/config';
import path from "path";
import morgan from 'morgan';
import express from 'express';
import { createServer } from 'http';

import './migrate.js';

import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

const { PORT } = process.env;

app.set('views', path.resolve('views'));
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.resolve('public')));

app.use(routes);

app.use(errorHandler.notFound);
app.use(errorHandler.errors);

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});