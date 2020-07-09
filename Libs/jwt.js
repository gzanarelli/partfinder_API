'use strict'

const _ = require('lodash')
const jwt = require('jsonwebtoken')
const Promise = require('bluebird')
const boom = require('boom')

module.exports = {
  sign (payload, secret, expiresIn) {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
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
  verify (token, xsrfToken) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.TOKEN_HS512, (err, payload) => {
        if (err) {
          reject(err)
        } else if (_.get(payload, 'xsrfToken') !== xsrfToken) {
          reject(boom.unauthorized(err))
        }
        resolve(payload)
      })
    })
  },
  refresh (token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.REFRESH_HS512, (err, payload) => {
        if (err) {
          reject(boom.unauthorized(err))
        }
        resolve(payload)
      })
    })
  }
}
