'use strict'

const _ = require('lodash')
const jwt = require('jsonwebtoken')
const Promise = require('bluebird')
const boom = require('boom')

module.exports = {
  sign (user, secret, expiresIn) {
    return new Promise((resolve, reject) => {
      console.log('token')  
      jwt.sign(
          {
            user: _.omit(user, ['password'])
          },
          secret,
          { algorithm: 'HS512', expiresIn: expiresIn })
          .then((token) => {
            console.log(token)
            resolve(token)
          })
          .catch(err => console.log(err))
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