'use strict'

const _ = require('lodash')
const jwt = require('jsonwebtoken')
const Promise = require('bluebird')
const boom = require('boom')

module.exports = {
  sign (user, secret, expiresIn, xsrf) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        {
          user: _.pick(user, ['email', 'firstname', 'lastname']),
          xsrf
        },
        secret,
        { algorithm: process.env.ALGO_TYPE, expiresIn: expiresIn },
        (err, token) => {
          if (err) {
            reject(err)
          }
          resolve(token)
        }
      )
    })
  },
  verify (token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.TOKEN_HS512, (err, payload) => {
        if (err) {
          reject(boom.unauthorized(err))
        }
        resolve(payload.user)
      })
    })
  },
  refresh (token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.REFRESH_HS512, (err, payload) => {
        if (err) {
          reject(boom.unauthorized(err))
        }
        resolve(payload.user)
      })
    })
  }
}
