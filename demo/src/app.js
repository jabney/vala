const $ = require('jquery')
const vala = require('../../vala')

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
      start: getNormalizedOffset(this, range),
      length: range.toString().length,
      cls: classes[currentCls],
      attrs: {title: 'id: ' + id},
      data: {id: id}
    })

    // Set the html of this paragraph to the string returned by vala.
    this.innerHTML = vala($(this).text(), Array.from(highlights.values()))
    e.stopPropagation()
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

/**
 * Iterate the given 'parent' node's children and find the length
 * of the selection range's actual start. We have to do this because
 * if the range begins inside of a child element, the range start will
 * be relative to that child node and not to the parent.
 *
 * @param {HTMLElement} parent
 * @param {Range} range
 */
function getNormalizedOffset(parent, range) {
  let stack = [parent]
  let offset = 0

  // Iterate child nodes with a stack instead of recursion.
  while (stack.length) {
    const node = stack.pop()
    // When the current node is the range's start node, we're done.
    if (node === range.startContainer) {
      return offset + range.startOffset
    }

    if (node.nodeType === Node.TEXT_NODE) {
      // Add the node text length to the running offset.
      offset += node.nodeValue.length
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Prepare to iterate this node's children.
      const childNodes = Array.prototype.slice.call(node.childNodes, 0)
      stack = stack.concat(childNodes.reverse())
    }
  }

  return -1
}
