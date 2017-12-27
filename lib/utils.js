
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
