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
* `arc.on('set', fn)` Can be used to track changes.

In addition, the construtor allows setting some tuning parameters,
like how many versions to save.  Persistant implementations (eg git)
may have additional methods to control synchronization.

## Example

```js
const { ArchivingMap } = require('archiving-map')

const arc = new ArchivingMap()

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

* (almost working) [git-archiving-map](https://npmjs.org/package/git-archiving-map.git) makes the pathnames be keys and their contents be values.  The versioning is handled by git, so you can use this with your usual git repos.
* (planned) [fs-archiving-map](https://npmjs.org/package/fs-archiving-map.git) makes the pathnames be keys and their contents be values, with versioning done like in emacs, where the first version of `myfile` is called `myfile~1~` and the 15th is `myfile~15~`.

Versions using pg and leveldb and redis might be nice. The leveldb version, at least, should work in the browser with IndexDB.  Maybe also a remote-over-websockets implementation would be nice.  Maybe the pg version could use temporal tables.


## The VersionMeta Object

Fields of each VersionMeta object:

* key: the key string which leads to the value of which this concerns a version
* hash: a printable ascii string without spaces representing a cryptographically secure hash of the body.  This is held in memory for rapid access.  The choice of hash algorithms, formats, and encodings is implementation dependent.  If you need a particular arrangement, add it as a tag.
* tags: array of tag strings
* time: a JavaScript Date instance representing the transaction time for this value
* counter, first version is 1.  Might have gaps or might change if/when earlier versions are deleted or move beyond the keepVersions horizon.

Async getter fields: (I don't love the naming, but it's quite unusual
that these are async, and I don't know a better way.)  These need to
be async to handle cases where we need to go to disk/remote to find
some very-early version.

* await bodyAsync : promise of the string or Buffer of the body contents
* await nextAsync, await previousAsync, await firstAsync, await currentAsync: resolve to the appropriate VersionMeta objects or null
* await versionsForward, await versionsBackward, resolves to an iterable over VersionMeta objects for this key

Functions:

* await match(vspec) : boolean, does this version match this vspec?
* await find(vspec) : search through all the versions of this value to find one matching the vpec.

[npm-image]: https://img.shields.io/npm/v/archiving-map.svg?style=flat-square
[npm-url]: https://npmjs.org/package/archiving-map
