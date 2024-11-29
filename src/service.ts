import express from 'express';
import cookieParser from 'cookie-parser';
import http from 'http';
import dotEnv from 'dotenv';
import {  CORS } from './tools/index';
import { Controllers } from './controllers/index';

dotEnv.config();
const app = express();

export const service = {
  init(app) {
    const port: number = parseInt(process.env.PORT || '8080');
    app.use(CORS.bind(this, app));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    Controllers.forEach(controller => {
      app.use("/", controller);
    });

    app.set('port', port);
    const server: http.Server = http.createServer(app);
    server.listen(port);

    server.on('listening', service.listen);
    server.on('error', service.error);
    return app;
  },
  listen (evt) {
    return evt;
  },
  error (evt) {
    return evt;
  }
}

export const activeApp = service.init(app);




