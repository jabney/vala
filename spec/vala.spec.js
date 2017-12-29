const vala = require('../vala')
const str = 'abcdefghijklmnopqrstuvwxyz'

const reText = />(\w+?)</
const reTag = /<(\w+)(?:\s+class="(.*?)")?>/

test('it properly creates multiple segments', () => {
  const segments = [
    { start: 0, end: 13 },
    { start: 13, end: 26 }
  ]

  const html = vala(str, segments)
  const regex = new RegExp(reText, 'g')
  let match, count = 0

  while ((match = regex.exec(html)) !== null) {
    const s = segments[count++]
    expect(str.slice(s.start, s.end)).toEqual(match[1])
  }

  expect(count).toBe(2)
})

test('it properly creates overlapping segments', () => {
  const segments = [
    { start: 0, end: 15 },
    { start: 10, end: 26 }
  ]

  const html = vala(str, segments)
  let match, regex, count

  count = 0
  regex = new RegExp(reText, 'g')
  while ((match = regex.exec(html)) !== null) {
    count++
  }
  // There should be three chunks of text.
  expect(count).toBe(3)

  count = 0
  regex = new RegExp(reTag, 'g')
  while ((match = regex.exec(html)) !== null) {
    count++
  }
  // There should be four tags.
  expect(count).toBe(4)

})

test('it works properly at the boundaries', () => {
  const html = vala(str, [{start: 0, length: 26}])
  const match = reText.exec(html)
  expect(match[1]).toEqual(str)
})

test('it has "vala" as the default class', () => {
  const html = vala(str, [{start: 0, length: 26}])
  const match = reTag.exec(html)
  expect(match[2]).toEqual('vala')
})

test('it can have its default class overridden', () => {
  const html = vala(str, [{start: 0, length: 26}], 'highlight')
  const match = reTag.exec(html)
  expect(match[2]).toEqual('highlight')
})

test('it can add segment-specific classes', () => {
  const segments = [
    { start: 0, length: 13, cls: 'first' },
    { start: 13, length: 13, cls: 'second' }
  ]
  const html = vala(str, segments)
  let regex = new RegExp(reTag, 'g')
  let match, count = 0
  while ((match = regex.exec(html)) !== null) {
    if (count++ === 0) {
      expect(match[2]).toBe('vala first')
    } else {
      expect(match[2]).toBe('vala second')
    }
  }
})

test('it can override the default span tag', () => {
  const html = vala(str, [{start: 0, length: 26, tag: 'li'}])
  const regex = new RegExp(reTag)
  const match = regex.exec(html)
  expect(match[1]).toEqual('li')
})

test('it can add data attributes', () => {
  const data = { first: '1', second: '2' }
  const html = vala(str, [{start: 0, length: 26, data: data}])
  expect(html).toContain('data-first="1"')
  expect(html).toContain('data-second="2"')
})

test('it can add custom attributes', () => {
  const attrs = { first: '1', second: '2' }
  const html = vala(str, [{start: 0, length: 26, attrs: attrs}])
  expect(html).toContain(' first="1"')
  expect(html).toContain(' second="2"')
})

test('it produces the same results whether "length" or "end" is used', () => {
  const html1 = vala(str, [{start: 0, length: 26}])
  const html2 = vala(str, [{start: 0, end: 26}])
  expect(html1).toBeTruthy()
  expect(html2).toBeTruthy()
  expect(html1).toEqual(html2)
})
