import { Router as Controller } from 'express';
import { LoginRepository } from '../repositories/entities/Login';
import IdentityPlatformService from '../services/IdentityPlatformService';

const loginService = new IdentityPlatformService();
const loginRepository = new LoginRepository();

export class Login {
  controller: Controller = Controller();
  
  constructor() {
    this.controller.post('/login', this.postLogin.bind(this));
  }
  
  async postLogin(req, res) {
    const userInput = {
      email: req.body.email,
      password: req.body.password,
    };
    
    try {
    
      const session = await loginService.loginUser(userInput);
      await loginRepository.create({
        email: userInput.email,
        date: new Date().toISOString().slice(0, -1)
      });
      res.status(200).send(session);
    } catch (err) {
      res.status(500).send(err);
      console.error(err);
    }
  }
};