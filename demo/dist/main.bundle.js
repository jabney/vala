/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const vala = __webpack_require__(1)
const utils = __webpack_require__(2)

const classes = ['', 'highlight', 'underline', 'overline']

/** @type {Map<number, any>} */
let highlights = new Map()
let currentCls = 1
let nextId = 0

// Get a jquery reference to the host paragraph.
const paragraph = $('p.host')

// Monitor the paragraph for mouseup events.
paragraph.on('mouseup', function(e) {
  const selection = document.getSelection()

  // Check for a valid selection (start != end).
  if (!selection.isCollapsed) {
    // Get the selection's Range object.
    const range = selection.getRangeAt(0)
    // Create a unique id for this highlight.
    const id = nextId++

    // Feed the highlights map with a new highlight.
    highlights.set(id, {
      start: utils.rangeStartOffset(this, range),
      length: range.toString().length,
      cls: classes[currentCls],
      attrs: {title: 'id: ' + id},
      data: {id: id}
    })

    // Set the html of this paragraph to the string returned by vala.
    this.innerHTML = vala($(this).text(), Array.from(highlights.values()))
    // e.stopPropagation()
  }
})

// Monitor for any mouseup events on vala highlights.
$('body').on('mouseup', '.vala', function (e) {
  // Remove the highlight.
  highlights.delete(+this.dataset.id)
  paragraph.html(vala(paragraph.text(), Array.from(highlights.values())))
  e.stopPropagation()
})

// Monitor the document for keyup events.
$(document).on('keyup', function (e) {
  const key = +e.key
  // If the key is 1-9, set the current highlight class index.
  if (/\d/.test(e.key) && key > 0 && key < classes.length) {
    currentCls = key
  }
})


/***/ }),
/* 1 */
/***/ (function(module, exports) {

/**
 * @typedef {Object} Segment
 * @property {number} start
 * @property {number} [end]
 * @property {number} [length]
 * @property {string} [tag]
 * @property {string} [cls]
 * @property {Object} [attrs]
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


/***/ }),
/* 2 */
/***/ (function(module, exports) {


/**
 * Iterate the given 'parent' node's children and find the length
 * of the selection range's actual start. We have to do this because
 * if the range begins inside of a child element, the range start will
 * be relative to that child node and not to the parent.
 *
 * @param {HTMLElement} parent
 * @param {Range} range
 */
function rangeStartOffset(parent, range) {
  var stack = [parent]
  var offset = 0
  var node, childNodes

  // Iterate child nodes with a stack instead of recursion.
  while (stack.length) {
    node = stack.pop()
    // When the current node is the range's start node, we're done.
    if (node === range.startContainer) {
      return offset + range.startOffset
    }

    if (node.nodeType === Node.TEXT_NODE) {
      // Add the node text length to the running offset.
      offset += node.nodeValue.length
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Prepare to iterate this node's children.
      childNodes = Array.prototype.slice.call(node.childNodes, 0)
      stack = stack.concat(childNodes.reverse())
    }
  }

  return -1
}

module.exports = {
  rangeStartOffset: rangeStartOffset
}


/***/ })
/******/ ]);