import { Router as Controller } from 'express';

export class Hello {
  controller: Controller = Controller();

  constructor() {
    this.controller.get("/hello", this.get.bind(this));
  }

  async get(req, res) {
    try {
      if (req.query.name) {
        res.status(200).send(`Hello ${req.query.name}`);
      } else {
        res.status(200).send("Hello World");
      }
    } catch (err) {
      res.status(500).send(err);
      console.error(err);
    }
  }
}
