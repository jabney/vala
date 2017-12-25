/**
 * @typedef {Object} Segment
 * @property {number} start
 * @property {number} [end]
 * @property {number} [length]
 * @property {string} [tag]
 * @property {string} [cls]
 * @property {string} [attrs]
 * @property {Object} [data]
 */

/**
 * @param {string} text
 * @param {Segment[]} segments
 * @param {string} [defaultClass]
 */
function vala(text, segments, defaultClass) {
  'use strict'

  if (!(Array.isArray(segments) && segments.length)) {
    return text
  }

  defaultClass = typeof defaultClass === 'undefined'
    ? 'vala' : defaultClass

  var vertices = []

  return segments.map(function (section, i) {
    // Create a pair of vertices for the start and end point
    // of each segment.
    return [{
      pos: section.start,
      tag: section.tag,
      cls: section.cls,
      attrs: section.attrs,
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
          return wrap(str, v, defaultClass)
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
 * @param {Object} v
 * @param {string} defCls
 */
function wrap(str, v, defCls) {
  var tag = v.tag || 'span'

  var template = '<#{tag}#{attrs}#{data}>' + str + '</' + tag + '>'
  var clsStr = ((defCls || '') + ' ' + (v.cls || '')).trim()

  var attrStr = Object.keys(v.attrs || {}).reduce(function (str, key) {
    return str + ' ' + key + '="' + v.attrs[key] + '"'
  }, '')

  var dataStr = Object.keys(v.data || {}).reduce(function (str, key) {
    return str + ' data-' + key + '="' + v.data[key] + '"'
  }, '')

  return template
    .replace('#{tag}', clsStr ? tag + ' class="' + clsStr + '"' : tag)
    .replace('#{attrs}', attrStr)
    .replace('#{data}', dataStr)
}

module.exports = vala
