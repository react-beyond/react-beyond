// Don't forget to add to your VSCode settings:

// "tailwindCSS.experimental.classRegex": [
//   "x-tw=\"([^\"]*)"
// ],

import clsx, { ClassValue } from 'clsx'
import { createElement } from 'react'
import { beyond } from 'react-beyond'

declare module 'react' {
  interface Attributes {
    'x-tw'?: ClassValue
  }
}

type Opts = {
  id?: string
}

export const tw =
  (opts: Opts = {}) =>
  (WrappedComponent) => {
    return beyond(WrappedComponent, {
      id: opts.id || 'tw',
      directiveProp: 'x-tw',
      mapElement: (el, directiveValue) => {
        return createElement(el.type, {
          ...el.props,
          ...(el.key && { key: el.key }),
          // "class" takes precendence over "className", beacuse that's how it
          // it works in React (see https://reactjs.org/docs/dom-elements.html#classname)
          className: clsx(directiveValue, el.props.className, el.props.class)
        })
      }
    })
  }

export const Tw = tw()(function Tw(props) {
  return props.children
})
