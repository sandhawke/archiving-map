const test = require('tape')
const git = require('.').git
const fs = require('fs').promises
const path = require('path')
const os = require('os')
const atEnd = require('tape-end-hook')
const simpleGit = require('simple-git/promise')
const del = require('del')

// make the temporary test directories
async function start (t) {
  const dirname = await fs.mkdtemp(path.join(os.tmpdir(), 'archmap-test-'))
        .catch(console.error)
  atEnd(t, async () => {
    console.error('keeping test dir for now: ', dirname)
    // const paths = await del(dirname, {force: true})
    // console.error('deleting ', paths)
  })
  const sg = simpleGit(dirname)
  await sg.init()
  return new git.ArchivingMap(dirname)
}

test(async (t) => {
  const arc = await start(t)

  const v1 = await arc.set('color', 'blue')
  t.equal(await arc.get('color'), 'blue')
  t.end()
})

test(async (t) => {
  const arc = await start(t)

  const v1 = await arc.set('color', 'blue')
  t.equal(await arc.get('color'), 'blue')

  await arc.set('color', 'red')
  // console.log(arc.map.get('color'))
  t.equal(await arc.get('color'), 'red')
  t.end()
})
/*  
  t.equal(await arc.get('color', v1), 'blue')
  t.equal(await arc.get('color', v1.hash), 'blue')
  // might get 'red' if the time hasn't changed
  // t.equal(await arc.get('color', v1.time), 'blue')
  t.equal(await arc.get('color', v1.counter), 'blue')
  t.equal(await arc.get('color', '' + v1.counter), 'blue')
  t.equal(await arc.get('color', v1.time.toISOString()), 'blue')

  v1.tags.push('v0.0.1')
  t.equal(await arc.get('color', 'v0.0.1'), 'blue')

  t.end()
})

test(async (t) => {
  const arc = new git.ArchivingMap()

  await arc.set('color', 'blue', { time: '2010' })
  t.equal(await arc.get('color'), 'blue')

  await arc.set('color', 'red', { time: '2015' })
  // console.log(arc.map.get('color'))
  t.equal(await arc.get('color'), 'red')

  t.equal(await arc.get('color', '2009'), undefined)
  t.equal(await arc.get('color', '2010'), 'blue')
  t.equal(await arc.get('color', '2015'), 'red')

  t.end()
})
 */
