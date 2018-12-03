const EventEmitter = require('events')
const vihash = require('./vihash')
const simpleGit = require('simple-git/promise')
const fs = require('fs').promises

/* 
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

*/

class ArchivingMap extends EventEmitter {
  constructor (state) {
    super()
    if (typeof state === 'string') state = { gitroot: state }
    Object.assign(this, state)
    if (!this.gitroot) throw Error('missing gitroot')
    this.git = simpleGit(this.gitroot)
  }

  realfile (key) {
    return this.gitroot + '/' + key
  }

  gitpath (key) {
    return './' + key
  }

  async set (key, value, options) {
    await fs.writeFile(this.realfile(key), value)
    await this.git.add(this.gitpath(key))
    await this.git.commit('auto')
    /* returns
      CommitSummary {
        branch: 'master',
        commit: 'cd977cb',
        summary: { changes: '1', insertions: '1', deletions: 0 },
        author: null }
    */
    // remove file, since we always use git.show ?  leave it for now
  }

  async get (key, vspec = 'HEAD') {
    return await this.git.show([vspec + ':' + this.gitpath(key)])
  }

  // if vspec is specified, we'll need to read the log into memory, I think.
  //
  // and we KINDA need to remember the vihash of every file?
  // MAYBE git will tell us that?
}


/*
Could load up a Box from the git log?



  const x = await git.log({file:'README.md'})
  console.log('RESULT: %O', x)

=>

RESULT: ListLogSummary {
  all:
   [ ListLogLine {
       hash: '2d86e55874aa9646f683101b9a8dd26f11ce971c',
       date: '2018-12-03 00:16:37 -0500',
       message: 'improve docs (HEAD -> master)',
       author_name: 'Sandro Hawke',
       author_email: 'sandro@hawke.org' },
     ListLogLine {
       hash: 'cd6d9cd318bdaa64ad97bff97a2f2f90fd264a74',
       date: '2018-12-03 00:12:53 -0500',
       message: 'kinda sorta works (origin/master)',
       author_name: 'Sandro Hawke',
       author_email: 'sandro@hawke.org' } ],
  latest:
   ListLogLine {
     hash: '2d86e55874aa9646f683101b9a8dd26f11ce971c',
     date: '2018-12-03 00:16:37 -0500',
     message: 'improve docs (HEAD -> master)',
     author_name: 'Sandro Hawke',
     author_email: 'sandro@hawke.org' },
  total: 2 }

*/

module.exports = { ArchivingMap }
