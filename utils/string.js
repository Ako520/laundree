const {escape, unescape} = require('base64-url')

function hexToBase64Url (hexString) {
  return escape(new Buffer(hexString, 'hex').toString('base64'))
}

function base64UrlToHex (base64UrlString) {
  return new Buffer(unescape(base64UrlString), 'base64').toString('hex')
}

/**
 * Returns corresponding short name
 * @param {string} name
 */
function shortName (name) {
  return name.toLocaleLowerCase().trim().match(/(^(.)| ([^\s])|[0-9])/g).map((m) => m.trim()).join('').toLocaleUpperCase()
}

module.exports = {
  hexToBase64Url, base64UrlToHex, shortName
}
