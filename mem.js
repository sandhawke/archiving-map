const vihash = require('./vihash')

let keepVersions = 100

class Version {
  constructor (state) {
    Object.assign(this, state)
    if (!this.hash) this.hash = vihash(this.body)
    if (!this.tags) this.tags = []
    if (this.time) {
      if (typeof this.time === 'string') {
        this.time = new Date(Date.parse(this.time))
      }
    } else {
      this.time = new Date()
    }
  }

  match (vspec) {
    return ((!vspec) ||
            (vspec === this) ||
            (vspec === this.hash) ||
            (vspec === this.time) ||
            (vspec === this.counter) ||
            (vspec === this.counter.toString()) ||
            (this.tags.includes(vspec)) ||
            (vspec === this.time.toISOString())
    )
  }
}

// This is where we keep many versions with the same key
//
// The versions are in a list, with the current one at [0]
//
class Box {
  constructor (state) {
    this.counter = 0
    this.versions = []
    this.keepVersions = keepVersions
    Object.assign(this, state)
  }

  // options overrides the constructor to Version, eg so you can
  // manually set a date this version becomes active, but ... don't
  // make it out of order!
  add (value, options) {
    this.counter++
    let arg = { body: value, counter: this.counter }
    arg = Object.assign(arg, options)
    const v = new Version(arg)
    this.versions.unshift(v)
    if (this.versions.length > this.keepVersions) {
      this.versions.splice(this.keepVersions, this.versions.length)
    }
    return v
  }

  get latest () {
    return this.versions[0]
  }

  match (vspec) {
    for (const v of this.versions) {
      if (v.match(vspec)) return v
    }

    // not sure it's great to rely on Date.parse
    // (maybe use moment.js?)
    const date = Date.parse(vspec)
    if (date) {
      for (const v of this.versions) {
        // find the latest version before this date
        if (v.time.getTime() <= date) return v
      }
    }

    return undefined
  }
}

class ArchivingMap {
  constructor (state) {
    Object.assign(this, state)
    if (!this.map) this.map = new Map()
    if (this.keepVersions === undefined) this.keepVersions = keepVersions
  }

  _getBox (key) {
    let box = this.map.get(key)
    if (!box) {
      box = new Box({ keepVersions: this.keepVersions })
      this.map.set(key, box)
    }
    return box
  }

  async set (key, value, options) {
    const box = this._getBox(key)
    const version = box.add(value, options)
    return version
  }

  async getVersion (key, vspec) {
    const box = this._getBox(key)
    const version = box.match(vspec)
    return version
  }

  async get (key, vspec) {
    const version = await this.getVersion(key, vspec)
    if (!version) return version
    return version.body
  }
}

module.exports = { ArchivingMap }
