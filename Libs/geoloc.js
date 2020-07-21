'use strict'

const options = {
  provider: 'opencage',
  httpAdapter: 'https',
  apiKey: process.env.GEOLOC_APIKEY,
  formatter: null
}
const geocoder = require('node-geocoder')(options)

module.exports = (address, zipcode) => {
  return geocoder.geocode({ address, zipcode }, (err, loc) => {
    if (err) {
      console.log('Error Geocode: ', err)
      return err
    }
    return loc
  })
}
