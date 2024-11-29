import { Router as Controller } from 'express';
import IdentityPlatformService from "../services/IdentityPlatformService";

const identityPlatformService = new IdentityPlatformService();

export class Register {
  controller: Controller = Controller();

  constructor() {
    this.controller.post("/register", this.post.bind(this));
  }

  async post(req, res) {
    try {
      const registerFields = req.body;
      registerFields.email = registerFields.email.toLowerCase();
      await identityPlatformService.createUser(
        registerFields.email,
        registerFields.password
      );
      const response = {
        email: registerFields.email
      };
      res.status(200).send(response);
    } catch (err) {
      
      res.status(500).send(err);
      console.error(err);
    }
  }
}
