import { check } from 'express-validator';

export const registerValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('username', 'Username is required').not().isEmpty(),
  check('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
];

export const loginValidation = [
  check('username', 'Username is required').not().isEmpty(),
  check('password', 'Password is required').not().isEmpty(),
];

export const emptyIngfoValidation = [
  check('name', 'Name is required').not().isEmpty(),
  check('address', 'Address is required').not().isEmpty(),
  check('number', 'Number is required').not().isEmpty(),
];