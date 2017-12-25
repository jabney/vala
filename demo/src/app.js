const $ = require('jquery')
const vala = require('../../vala')

const highlights = []
const classes = ['', 'highlight', 'underline', 'overline']
let currentCls = 1
let nextId = 0

$('p').on('mouseup', function() {
  const selection = document.getSelection()

  if (!selection.isCollapsed) {
    const range = selection.getRangeAt(0)
    const start = getNormalizedOffset(this, range)
    const end = start + range.toString().length
    const id = nextId++

    highlights.push({
      start,
      length: range.toString().length,
      cls: classes[currentCls],
      data: {id: id}
    })

    this.innerHTML = vala($(this).text(), highlights)

    $('.vala').each(function () {
      $(this).attr('title', 'id: ' + this.dataset.id)
    })
  }
})

$(document).on('keyup', function (e) {
  if (/\d/.test(e.key) && e.key > '0' && e.key < classes.length) {
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
