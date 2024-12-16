
import { Router as Controller } from 'express';
import { Register } from './Register';
import { Login } from './Login';
import { Hello } from './sample';
import { DifyAI } from './difyai';

export const Controllers: Array<Controller> = [
    new Hello().controller,
    new Login().controller,
    new Register().controller,
    new DifyAI().controller
];
