// Don't forget to add to your VSCode settings:

// "tailwindCSS.experimental.classRegex": [
//   "_clsx=\"([^\"]*)"
// ],
import _clsx, { ClassValue } from 'clsx'
import React, { createElement } from 'react'
import { beyond } from 'react-beyond'

const refAsProp = !/^0|^1[5678]/.test(React.version)

declare module 'react' {
  interface Attributes {
    'x-clsx'?: ClassValue
  }
}

type Opts = {
  /**
   * The id of the hoc. Must be unique.
   * @default 'clsx'
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
          ...(!refAsProp && el.ref && { key: el.ref }),
          ...(el.key && { key: el.key }),
          className: _clsx(directiveValue, el.props.className)
        })
      }
    })
  }
