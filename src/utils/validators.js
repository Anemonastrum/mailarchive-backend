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

export const profileUpdateCheck = [
  check('nbm', 'NBM is required').not().isEmpty().isNumeric(),
  check('name', 'Name is required').not().isEmpty(),
  check('number', 'Number is required').not().isEmpty().isNumeric(),
  check('address', 'Address is required').not().isEmpty(),
];

export const memberAddCheck = [
  check('name', 'Name is required').not().isEmpty().matches(/^[A-Za-z\s]+$/),
  check('username', 'Username is required').not().isEmpty(),
  check('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
  check('position', 'Position is required').not().isEmpty(),
];

export const organizationCheck = [
  check('name', 'Name is required').not().isEmpty(),
  check('address', 'Address is required').not().isEmpty(),
  check('number', 'Number is required').not().isEmpty().isNumeric(),
  check('email', 'Email is required').not().isEmpty(),
];

export const changePasswordCheck = [
  check('currentPassword', 'Password lama wajib diisi').notEmpty(),
  check('newPassword', 'Password baru wajib diisi').notEmpty(),
  check('newPassword', 'Password baru minimal 8 karakter').isLength({ min: 8 }),
];

export const createInboxCheck = [
  check('number', 'Number is required').not().isEmpty(),
  check('category', 'Category is required').not().isEmpty(),
  check('date', 'Date is required').not().isEmpty(),
  check('origin', 'Origin is required').not().isEmpty(),
  check('summary', 'Summary is required').not().isEmpty(),
];

export const editInboxCheck = [
  check('number', 'Number is required').not().isEmpty(),
  check('category', 'Category is required').not().isEmpty(),
  check('date', 'Date is required').not().isEmpty(),
  check('origin', 'Origin is required').not().isEmpty(),
  check('summary', 'Summary is required').not().isEmpty(),
];

export const createOutboxCheck = [
  check('number', 'Number is required').matches(/^\d{1,4}\/[A-Z]{2,5}\/[A-Z]\/(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)\/\d{4}$/),
  check('category', 'Category is required').not().isEmpty(),
  check('date', 'Date is required').not().isEmpty(),
  check('destination', 'Destination is required').not().isEmpty(),
  check('summary', 'Summary is required').not().isEmpty(),
  check('content', 'Content is required').not().isEmpty(),
];

export const editOutboxCheck = [
  check('number', 'Number is required').matches(/^\d{1,4}\/[A-Z]{2,5}\/[A-Z]\/(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)\/\d{4}$/),
  check('category', 'Category is required').not().isEmpty(),
  check('date', 'Date is required').not().isEmpty(),
  check('destination', 'Destination is required').not().isEmpty(),
  check('summary', 'Summary is required').not().isEmpty(),
];

export const manageUserCheck = [
  check('nama', 'Nama wajib diisi').notEmpty(),
  check('nbm', 'NBM wajib diisi').notEmpty(),
  check('position', 'Jabatan wajib diisi').notEmpty(),
  check('number', 'Nomor HP wajib diisi').notEmpty().isNumeric()
];