const $ = require('jquery')
const vala = require('../../vala')

const classes = ['', 'highlight', 'underline', 'overline']

let highlights = new Map()
let currentCls = 1
let nextId = 0

const paragraph = $('p.host')

paragraph.on('mouseup', function(e) {
  const selection = document.getSelection()

  if (!selection.isCollapsed) {
    const range = selection.getRangeAt(0)
    const id = nextId++

    highlights.set(id, {
      start: getNormalizedOffset(this, range),
      length: range.toString().length,
      cls: classes[currentCls],
      attrs: {title: 'id: ' + id},
      data: {id: id}
    })

    this.innerHTML = vala($(this).text(), Array.from(highlights.values()))
    e.stopPropagation()
  }
})

$('body').on('mouseup', '.vala', function (e) {
  // Remove the highlight.
  highlights.delete(+this.dataset.id)
  paragraph.html(vala(paragraph.text(), Array.from(highlights.values())))
  e.stopPropagation()
})

$(document).on('keyup', function (e) {
  if (/\d/.test(e.key) && e.key > '0' && +e.key < classes.length) {
    currentCls = e.key
  }
})

/**
 * @param {HTMLElement} parent
 * @param {Range} range
 */
function getNormalizedOffset(parent, range) {
  let stack = [parent]
  let offset = 0

  while (stack.length) {
    const node = stack.pop()

    if (node === range.startContainer) {
      return offset + range.startOffset
    }

    if (node.nodeType === Node.TEXT_NODE) {
      offset += node.nodeValue.length
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const childNodes = Array.prototype.slice.call(node.childNodes, 0)
      stack = stack.concat(childNodes.reverse())
    }
  }
}
