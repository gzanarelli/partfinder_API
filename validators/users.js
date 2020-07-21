'use strict'

const { body, param } = require('express-validator')

module.exports = {
  POST: [
    body('firstname')
      .exists()
      .isString(),
    body('lastname')
      .exists()
      .isString(),
    body('gender')
      .exists()
      .isString()
      .isIn(['male', 'female'])
      .withMessage('Only male or female accepted'),
    body('age')
      .exists()
      .isNumeric(),
    body('address')
      .exists()
      .isString(),
    body('zipcode')
      .exists()
      .isNumeric(),
    body('city')
      .exists()
      .isString()
  ],
  PATCH: [
    body('firstname')
      .exists()
      .isString(),
    body('lastname')
      .exists()
      .isString(),
    body('gender')
      .exists()
      .isString()
      .isIn(['male', 'female'])
      .withMessage('Only male or female accepted'),
    body('age')
      .exists()
      .isNumeric(),
    body('address')
      .exists()
      .isString(),
    body('zipcode')
      .exists()
      .isNumeric(),
    body('city')
      .exists()
      .isString()
  ],
  DELETE: [
    param('userId')
      .exists()
      .isMongoId()
  ]
}
