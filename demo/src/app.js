const vala = require('../../vala')
const utils = require('../../lib/utils')

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
