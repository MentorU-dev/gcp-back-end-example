
import { Router as Controller } from 'express';
import { Register } from './Register';
import { Login } from './Login';
import { Hello } from './sample';

export const Controllers: Array<Controller> = [
    new Hello().controller,
    new Login().controller,
    new Register().controller
];