/**
 * @typedef {Object} Segment
 * @property {number} start
 * @property {number} [end]
 * @property {number} [length]
 * @property {string} [tag]
 * @property {string} [cls]
 * @property {Object} [data]
 */

/**
 * @param {string} text
 * @param {Segment[]} segments
 * @param {string} [defaultClass]
 */
function highlight(text, segments, defaultClass) {
  'use strict'

  defaultClass = typeof defaultClass === 'undefined'
    ? 'highlight' : defaultClass

  var vertices = []

  return segments.map(function (section, i) {
    // Create a pair of vertices for the start and end point
    // of each segment.
    return [{
      pos: section.start,
      tag: section.tag,
      cls: section.cls,
      data: section.data,
      group: i
    },{
      pos: section.end || section.start + section.length,
      group: i
    }]
  })
  .reduce(function (list, pair) {
    // Flatten the vertex pairs into a list of vertices.
    list.push(pair[0], pair[1])
    return list
  }, [])
  .sort(function (a, b) {
    // Sort by position ascending.
    return a.pos - b.pos
  })
  .reduce(function (list, v, i, a) {
    // Track tag hierarchy.
    if (vertices[v.group]) {
      delete vertices[v.group]
    } else {
      vertices[v.group] = v
    }

    // Add the first chunk of text if applicable.
    if (i === 0 && v.pos > 0) {
      list.push(text.slice(0, v.pos))
    }

    // Add each chunk as described by the vertices.
    if (i < a.length - 1) {
      var section = text.slice(a[i].pos, a[i+1].pos)
      if (section) {
        list.push(vertices.reduce(function (str, v) {
          return wrap(str, v.tag || 'span', v.cls, v.data, defaultClass)
        }, section))
      }
    }

    // Add the last chunk of text if applicable.
    if (i === a.length - 1 && v.pos < text.length) {
      list.push(text.slice(v.pos, text.length))
    }

    return list
  }, [])

  .join('')
}

/**
 * @param {string} str
 * @param {string} tag
 * @param {string} cls
 * @param {Object} data
 * @param {string} defCls
 */
function wrap(str, tag, cls, data, defCls) {
  var template = '<#{tag}#{data}>' + str + '</' + tag + '>'
  var clsStr = ((defCls || '') + ' ' + (cls || '')).trim()

  var dataStr = Object.keys(data || {}).reduce(function (str, key) {
    return str + ' data-' + key + '="' + data[key] + '"'
  }, '')

  return template
    .replace('#{tag}', clsStr ? tag + ' class="' + clsStr + '"' : tag)
    .replace('#{data}', dataStr)
}

// var highlighted = highlight('abcdefghijklmnopqrstuvwxyz', [{
//   start: 2,
//   length: 20, // c-v
//   tag: 'a',
//   // cls: 'a'
// },{
//   start: 5,
//   length: 10, // f-o
//   tag: 'b',
//   // cls: 'b'

// //   start: 1,
// //   length: 10, // b-k
// //   tag: 'a',
// //   // cls: 'a'
// // },{
// //   start: 5,
// //   length: 20, // f-y
// //   tag: 'b',
// //   // cls: 'b'

// }], null)

// console.log(highlighted)

module.exports = highlight
