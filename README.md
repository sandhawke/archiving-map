
# archiving-map

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

Currently just mem.js version is implemented.

Planning to make a version backed by git, which is why it's async.

Maybe have a setMany(kvmap) to gather changes into one commit?

Concurrency?  What happens if you call arc.set a second time before
the first resolves?  Leave this up to git?  Or serialize it through a
sleep-loop with an input queue?   (loop.wake() when you add to the queue)

Maybe simple-git does this for us.  Looks like it.

v1, etc, are { time, hash, tags[] }.   maybe .key and .value, if you want to pass it in with any of those values set.   it's really makeVersion.

arc.tag(vspec, 'tag')

