(function ($) {
  'use strict'

  /**
   * @typedef {Object} Options
   * @property {string} host
   * @property {string} cls
   * @property {boolean} useTagData
   * @property {boolean} trimText
   *
   * @typedef {Object} RangeInfo
   * @property {number} start
   * @property {number} end
   * @property {string} str
   *
   * @typedef {Object} Highlight
   * @property {number} start
   * @property {number} [end]
   * @property {number} [length]
   * @property {string} [tag]
   * @property {string} [cls]
   * @property {Object} [attrs]
   * @property {Object} [data]
   *
   * @typedef {(event: any, id: number, range: RangeInfo) => Promise<Highlight[]>&Highlight[]} AddCallback
   */

  var vala = require('../vala')
  var utils = require('../lib/utils')

  /** @type {Options} */
  var defaults = {
    host: '.vala-host',
    cls: 'vala',
    useTagData: true,
    trimText: true
  }

  /**
   * @function
   * @param {Object} options
   * @param {AddCallback} onMouseup
   */
  // @ts-ignore
  $.fn.vala = function (options, onMouseup) {
    var self = this
    var opts = $.extend({}, defaults, options || {})
    var nextId = 0

    if (opts.useTagData) {
      processTagData()
    }

    monitor()

    function mouseup(e) {
      var self = this
      var selection = document.getSelection()

      // Check for a valid selection (start != end).
      if (selection.isCollapsed) { return }

      var range = selection.getRangeAt(0)
      var id = nextId++
      var start = utils.rangeStartOffset(this, range)
      var str = range.toString()
      var end = start + str.length
      var result

      // Start will be -1 on some multi-paragraph selections. These
      // aren't properly supported by this plugin.
      if (start >= 0) {
        result = onMouseup && onMouseup.call(this, e, id, {
          start: start,
          end: end,
          str: str
        }, function done(result) {
          self.innerHTML = render($(self).text(), result)
        })

        if (result && typeof result.then === 'function') {
          result.then(function(highlights) {
            self.innerHTML = render($(self).text(), highlights)
          })
        } else if (Array.isArray(result)) {
          this.innerHTML = render($(this).text(), result)
        }
      }
    }

    function render(text, highlights) {
      if (opts.trimText) { text = text.trim() }
      return vala(text, highlights, opts.cls)
    }

    /**
     * Listen for mouseup on all host containers.
     */
    function monitor() {
      self.find(opts.host).each(function (e) {
        $(this).off('mouseup', mouseup)
        $(this).on('mouseup', mouseup)
      })
    }

    /**
     * Set highlights from data-vala tags, if any.
     */
    function processTagData() {
      $(opts.host + '[data-vala]').each(function () {
        const data = JSON.parse(this.dataset.vala)
          if (Array.isArray(data)) {
          this.innerHTML = vala($(this).text(), data, opts.cls)
        }
      })
    }

    return {

      /**
       * Return a vala markup string.
       *
       * @function
       * @param {string} text
       * @param {Highlight[]} highlights
       * @param {string} [defaultClass]
       * @returns {string}
       */
      render: function (text, highlights, defaultClass) {
        defaultClass = typeof defaultClass === 'undefined'
          ? opts.cls : defaultClass
        return vala(text, highlights, defaultClass)
      },

      /**
       * Unbind vala-bound events.
       *
       * @function
       */
      unbind: function () {
        self.find(opts.host).each(function () {
          $(this).off('mouseup')
        })
      },

      /**
       * Create highlights from data-vala attributes in the dom.
       *
       * @function
       */
      processTagData: processTagData,

      /**
       * Listen for mouseup on all host containers.
       *
       * @function
       */
      monitor: monitor
    }
  }

  // @ts-ignore
  $.fn.vala.defaults = defaults

  function typeOf(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1)
  }

})(jQuery)
