// Don't forget to add to your VSCode settings:

// "tailwindCSS.experimental.classRegex": [
//   "_tw=\"([^\"]*)"
// ],

import clsx from 'clsx'
import { createElement } from 'react'
import { deepHoc } from 'react-deephoc'

declare module 'react' {
  interface Attributes {
    'x-tw'?: string
  }
}

type Opts = {
  id?: string
}

export const deepTw =
  (opts: Opts = {}) =>
  (WrappedComponent) => {
    return deepHoc(WrappedComponent, {
      id: opts.id || 'deepTw',
      directiveProp: 'x-tw',
      mapElement: (el, directiveValue) => {
        return createElement(el.type, {
          ...el.props,
          ...(el.ref && { ref: el.ref }),
          ...(el.key && { key: el.key }),
          // "class" takes precendence over "className", beacuse that's how it
          // it works in React (see https://reactjs.org/docs/dom-elements.html#classname)
          className: clsx(directiveValue, el.props.className, el.props.class)
        })
      }
    })
  }

export const DeepTw = deepTw()(function DeepTw(props) {
  return props.children
})
