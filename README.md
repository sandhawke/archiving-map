# archiving-map
[![NPM version][npm-image]][npm-url]

An **ArchivingMap** is like JavaScript **Map** except that:

* Everything is async (using promises) because this kind of data should often be kept on slower storage (not memory)
* Every value you set for a key is remembered and can be accessed later

Basically ArchivingMap : Map == git : normal files

Aside from being async, the API differs from Map like this

* `await arc.set({key1: value1, key2: value2, key3: value3, ...})` because sometimes we want to set several values at once.  When backed by git, this makes the changes go into the same commit.
* `await arc.get(key, vspec)` There is an optional "version specifier" vspec argument to indicate which version you want.  It can be a tag, a hash, a counter value, or a time.
* `await arc.getMeta(key, vspec)` operates the same as arc.get except that it returns the value wrapped in a metadata object with data about the version, including the hash values, tags, and modification time.  It also has a way to list other versions.
* `await arc.tag(key, tagToBeAdded)`  Add a tag string, to be later used as a vspec.

In addition, the construtor allows setting some tuning parameters,
like how many versions to save.  Persistant implementations (eg git)
may have additional methods to control synchronization.

## Example

```js
const { ArchivingMap } = require('archiving-map')

const arc = new ArchivingMap('./mydata')

v1 = await arc.set('user/alice', '<html> ....  whatever .... </html>')
v2 = await arc.set('user/alice', '<html> ....  whatever version 2 .... </html>')

arc.get('user/alice')
// => '<html> ....  whatever version 2 .... </html>'

// get a particular version
await arc.get('user/alice', v1.hash)
// => '<html> ....  whatever .... </html>


// binary data is fine, but there's no where to keep Content-Type.   So put
// it in the key, like you do in a filesystem.
arc.set('icon.jpg', someBinaryData)
```

## Storage Implementations

This module just provides in-memory storage, which is fine for small, ephermeral data sets. Persistence modules can extend it.  Specificially:

* (almost working) [git-archiving-map](https://npmjs.org/package/git-archiving-map.git) makes the pathnames be keys and their contents be values, git handling all the versioning.
* (planned) [fs-archiving-map](https://npmjs.org/package/fs-archiving-map.git) makes the pathnames be keys and their contents be values, with versioning done like in emacs, where the first version of `myfile` is called `myfile~1~`, etc.

Versions using pg and level and redis might be nice.  Also, a version
that works in browsers would be good.

[npm-image]: https://img.shields.io/npm/v/archiving-map.svg?style=flat-square
[npm-url]: https://npmjs.org/package/archiving-map
