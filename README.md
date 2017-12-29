# vala
[![Build Status](https://travis-ci.org/jabney/vala.svg?branch=master)](https://travis-ci.org/jabney/vala)

Generate HTML markup for highlighting segments of text

<!-- <div style="color: gray; background-color: white; padding: 0.5rem; font-family: monospace; font-size: 16px;">
  &lt;/<span style="border-bottom: 1px solid #0aa; background-color: #eff;">va</span><span style="border-top: 1px solid #a00; background-color: #fee;">la</span>&gt;
</div> -->

![vala](https://github.com/jabney/vala/raw/master/assets/vala.png)

![vala demo animation](https://github.com/jabney/vala/raw/master/assets/vala.gif)

**Under development**

Includes a jQuery plugin

See the [demo source](https://github.com/jabney/vala/tree/master/demo/src) folder for example usage.

Open [index.html](https://github.com/jabney/vala/tree/master/demo/dist) in the [dist](https://github.com/jabney/vala/tree/master/demo/dist) folder to see the demo project in action.

## Installation

```bash
npm install vala
```

## Contents
- [vala usage](#vala-usage)
- [vala jquery plugin](#vala-jquery-plugin)

### vala usage

```bash
const vala = require('vala')
```

Vala takes a string and a list of segments and returns html markup generated from the segments list.

```javascript
const source = "And they lived happily ever after."

const segments = [{
  start: 15,
  length: 'happily'.length
}]

const markup = vala(source, segments)
```

markup

```
And they lived <span class="vala">happily</span> ever after.
```

#### vala Signature

```typescript
vala(text: string, segments: vala.Segment[], defaultClass?: string): string

// text: the source text to mark up.
// segments: a list of vala segments.
// defaultClass: a class to apply to all marked up segments (default: vala).
```

#### vala Segments

```typescript
interface Segment {
  start: number    // The start offset of the segment
  end?: number     // The end offset of the segment (or use 'length')
  length?: number  // The length of the segment (ignored if 'end' is used)
  tag?: string     // The tag to wrap with (default: 'span')
  cls?: string     // A class string for the segment (class="vala [cls]")
  attrs?: {[key:string]: string}  // Custom attributes added to the tag
  data?: {[key:string]: string}   // Data attributes added to the tag
}
```

```javascript
const source = "And they lived happily ever after."

const segments = [{
  start: 15,
  end: 22,
  cls: 'highlight',
  data: {id: 1}
}]

const markup = vala(source, segments)
```

markup

```
And they lived
<span class="vala highlight" data-id="1">happily</span>
ever after.
```

#### Multiple overlapping segments.
Vala segments can overlap. This results in nested markup that preserves segment data for each tag generated.

```javascript
const source = "And they lived happily ever after."

const segments = [{
  start: 4,
  end: 33,
  tag: 'em',
  data: {id: 1}
}, {
  start: 15,
  length: 7,
  tag: 'strong',
  data: {id: 2}
}, {
  start: 23,
  end: 33,
  tag: 'strike',
  data: {id: 3}
}]

// Pass null as the third arg to remove the default class.
const markup = vala(source, segments, null)
```

markup

```
And
<em data-id="1">they lived </em>
<strong data-id="2">
  <em data-id="1">happily</em>
</strong><em data-id="1"> </em>
<strike data-id="3">
  <em data-id="1">ever after</em>
</strike>
.
```

renders as

And <em data-id="1">they lived </em><strong data-id="2"><em data-id="1">happily</em></strong><em data-id="1"> </em><strike data-id="3"><em data-id="1">ever after</em></strike>.

Although this is a simple example of overlapping, vala segments can overlap in complex and arbitrary ways.

### vala jquery plugin

The jquery plugin wraps `vala` and provides some additional functionality for creating highlights in rendered html "paragraphs" or vala "hosts". See the [vala demo source](https://github.com/jabney/vala/tree/master/demo/src) which was used to create the following demo animation:

![vala demo animation](https://github.com/jabney/vala/raw/master/assets/vala.gif)

Note that the demo includes code for creating in-page highlights both with and without the jquery plugin.

To make use of the plugin, add the class `vala-host` to a plain-text element:

```html
<p class="vala-host">Right size, right build, right hair, right on.</p>
```

The plugin monitors all `.vala-host` elements in existence at the time the
plugin is configured (`.vala-host` is the default `host` selector).

Configure the plugin:

```javascript
  // Attach to the body or some other parent container.
  const vala = $('body').vala({},
    // The callback is issued whenever the user selects text
    // in a vala host element.
    //
    // The 'event' argument contains the jquery mouseup event.
    //
    // The 'id' argument contains a unique, monotonic highlight id.
    //
    // The 'range' argument contains data about the selection,
    // including its start and end offsets, and the selected substring.
    //
    // The 'done' argument is a callback that can be issued for
    // asynchronous behavior.
    function (event, id, range, done) {
      // Either return a list of highlights...
      return [{
        start: range.start,
        end: range.end
      }]
      // ...or call 'done' for async behavior...
      // done([...])
      // ...or return a promise for async behavior...
      // return new Promise((resove, reject) => {
      //   resolve([...])
      // })
    })
```

result

```html
<p class="vala-host">
  Right size, right build, right hair,
  <span class="vala">right on</span>
  .
</p>
```

The above result assumes that "right on" was selected by the user in the browser.

Note: vala hosts should be plain text containers: vala will replace the contents
of the container with the highlight markup.

#### Plugin options

```javascript
// These are the default options.
const options = {
  host: '.vala-host', // the host selector
  cls: 'vala'         // the default class for all highlights
  useTagData: true    // Preprocess the dom for 'data-vala' attributes
}

const vala = $('body').vala(options, function (event, id, range) {...})
```

#### `data-vala` attributes
Vala hosts can be preconfigured with hightlight data if desired.

```html
<span class="vala-host"
  data-vala='[{"start": 26, "length": 7, "tag": "em"}]'>
  Listen, Mr. Kansas Law Dog. Law don't go around here. Savvy?
</span>
```

result

```html
<span class="vala-host">
  Listen, Mr. Kansas
  <em class="vala">Law Dog</em>
  . Law don't go around here. Savvy?
</span>
```

<span class="vala-host">
  Listen, Mr. Kansas
  <em class="vala">Law Dog</em>
  . Law don't go around here. Savvy?
</span>

#### Plugin interface

```javascript
const vala = $('body').vala({}, function (event, id, range) {...})
```

`render` returns a marked-up string. Call this function if you want to create markup for elements independent of the plugin's host `mouseup` mechanism.

```javascript
const markup = vala.render('one two three four', [{start: 8, length: 5}])
```

markup

```html
one two <span class="vala">three</span> four
```

`unbind` removes all host `mouseup` listeners. Call this function if you want the plugin to stop listening for host `mouseup` events. This behavior can be reversed with a call to `monitor`.

`processTagData` processes all host elements with `data-vala` attributes. Call this function if you're adding `data-vala` attributes to vala host elements dynamically after the plugin is instantiated.

`monitor` adds `mouseup` listeners to all host elements. Call this function if you've added vala host elements dynamically after the plugin is instantiated, or have previously called `unbind`.
