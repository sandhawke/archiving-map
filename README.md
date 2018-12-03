
# archiving-map

```js
const { ArchivingMap } = require('archiving-map')

const arc = new ArchivingMap('./mydata')

v1 = await arc.set('user/alice', '<html> ....  whatever .... </html>')
v2 = await arc.set('user/alice', '<html> ....  whatever version 2 .... </html>')

arc.get('user/alice')
// => '<html> ....  whatever version 2 .... </html>'

await arc.getVersion('user/alice', v1.id)
// => '<html> ....  whatever .... </html>


// binary data is fine, but there's no where to keep Content-Type.   So put
// it in the key, like you do in a filesystem.
arc.set('icon.jpg', someBinaryData)


```

Backed by simple-git.  A 'version' is one file in a commit.  We don't
group into a commit.  Maybe we should?  Arc.setMany(kvmap) all in one
commit, and with maybe one event distributed?  Hrm.  Later.

Concurrency?  What happens if you call arc.set a second time before
the first resolves?  Leave this up to git?  Or serialize it through a
sleep-loop with an input queue?   (loop.wake() when you add to the queue)

Maybe simple-git does this for us.  Looks like it.

v1, etc, are { time, hash, tags[] }.   maybe .key and .value, if you want to pass it in with any of those values set.   it's really makeVersion.



arc.tag(vspec, 'tag')

simplegit.tags(...) gets tags

.show vs .catFile ?

