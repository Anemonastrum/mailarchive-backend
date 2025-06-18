import { check } from 'express-validator';

export const registerCheck = [
  check('name', 'Name is required').not().isEmpty(),
  check('username', 'Username is required').not().isEmpty(),
  check('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
];

export const loginCheck = [
  check('username', 'Username is required').not().isEmpty(),
  check('password', 'Password is required').not().isEmpty(),
];

export const organizationCheck = [
  check('name', 'Name is required').not().isEmpty(),
  check('address', 'Address is required').not().isEmpty(),
  check('number', 'Number is required').not().isEmpty(),
];

