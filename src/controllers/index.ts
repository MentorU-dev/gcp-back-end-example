
import { Router as Controller } from 'express';
import { Register } from './Register';
import { Login } from './Login';

export const Controllers: Array<Controller> = [
    new Login().controller,
    new Register().controller
];