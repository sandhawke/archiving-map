// written two ways because I'm having an issue

const crypto = require('crypto')
const ssri = require('ssri')
const debug = require('debug')('vihash')

function vihash (text, algo = 'sha256') {
  debug('vihash %s', text)
  const computed = ssri.fromData(text, {
    algorithms: [algo]
  })
  const cs = url64(computed.toString())

  const hash = crypto.createHash(algo)
  hash.update(text)
  const cc = 'sha256-' + hash.digest('base64').replace(/\//g, '_').replace(/\+/g, '-')

  if (cc !== cs) throw Error('hash computation mismatch')
  return cc
}

// convert from base64 to base64url if needed
function url64 (text) {
  return text.replace(/\+/g, '-').replace(/\//g, '_')
}

module.exports = vihash
