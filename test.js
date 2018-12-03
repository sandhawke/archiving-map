const test = require('tape')
const mem = require('./mem')

test(async (t) => {
  const arc = new mem.ArchivingMap()

  const v1 = await arc.set('color', 'blue')
  t.equal(await arc.get('color'), 'blue')

  await arc.set('color', 'red')
  // console.log(arc.map.get('color'))
  t.equal(await arc.get('color'), 'red')

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
  const arc = new mem.ArchivingMap()

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
