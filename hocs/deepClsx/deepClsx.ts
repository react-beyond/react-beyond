// Don't forget to add to your VSCode settings:

// "tailwindCSS.experimental.classRegex": [
//   "_clsx=\"([^\"]*)"
// ],
import clsx, { ClassValue } from 'clsx'
import { createElement } from 'react'
import { deepHoc } from 'react-deephoc'

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
  id: 'deepClsx'
}

export const deepClsx =
  (_opts: Opts = {}) =>
  (WrappedComponent) => {
    const opts = { ...defaults, ..._opts }

    return deepHoc(WrappedComponent, {
      id: opts.id,
      directiveProp: 'x-clsx',
      mapElement: (el, directiveValue) => {
        return createElement(el.type, {
          ...el.props,
          ...(el.ref && { ref: el.ref }),
          ...(el.key && { key: el.key }),
          className: clsx(directiveValue, el.props.className)
        })
      }
    })
  }

export const DeepClsx = deepClsx()(function DeepClsx(props) {
  return props.children
})
