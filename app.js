import 'dotenv/config';
import morgan from 'morgan';
import express from 'express';
import { createServer } from 'http';

import './migrate.js';

import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

const { PORT } = process.env;

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(routes);

app.use(errorHandler.notFound);
app.use(errorHandler.errors);

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});