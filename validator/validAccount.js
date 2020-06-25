'use strict'

const { body } = require('express-validator')

module.exports = {
  SIGNIN: [
    body('email')
      .exists()
      .withMessage('This field is required.')
      .isEmail()
      .withMessage('A valid email is required.'),
    body('password')
      .exists()
      .withMessage('This field is required.')
      .isLength(8)
  ],
  SIGNUP: [
    body('email')
      .exists()
      .withMessage('This field is required.')
      .isEmail()
      .withMessage('A valid email is required.'),
    body('password')
      .exists()
      .withMessage('This field is required.')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long.')
  ]
}
