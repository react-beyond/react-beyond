// Don't forget to add to your VSCode settings:

// "tailwindCSS.experimental.classRegex": [
//   "_clsx=\"([^\"]*)"
// ],
import _clsx, { ClassValue } from 'clsx'
import { createElement } from 'react'
import { beyond } from 'react-beyond'

declare module 'react' {
  interface Attributes {
    'x-clsx'?: ClassValue
  }
}

type Opts = {
  /**
   * The id of the hoc. Must be unique.
   * @default 'deepClsx'
   */
  id?: string
}

const defaults: Opts = {
  id: 'clsx'
}

export const clsx =
  (_opts: Opts = {}) =>
  (WrappedComponent) => {
    const opts = { ...defaults, ..._opts }

    return beyond(WrappedComponent, {
      id: opts.id,
      directiveProp: 'x-clsx',
      mapElement: (el, directiveValue) => {
        return createElement(el.type, {
          ...el.props,
          ...(el.ref && { ref: el.ref }),
          ...(el.key && { key: el.key }),
          className: _clsx(directiveValue, el.props.className)
        })
      }
    })
  }

export const Clsx = clsx()(function Clsx(props) {
  return props.children
})