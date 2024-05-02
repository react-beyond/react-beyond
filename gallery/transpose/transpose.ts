import React, { ReactElement, createElement } from 'react'
import { beyond } from 'react-beyond'

const refAsProp = !/^0|^1[5678]/.test(React.version)

declare module 'react' {
  interface Attributes {
    'x-transpose'?: (self: ReactElement) => ReactElement
  }
}

type BaseOpts = {
  /**
   * The id of the hoc. Must be unique.
   * @default 'transpose'
   */
  id?: string
}

type Opts =
  | BaseOpts
  | (BaseOpts & {
      /**
       * The name of a custom directive on which this HOC will act, along with
       * `x-transpose`. This HOC transposes the 'x-transpose' prop
       * typing, because
       * @default 'x-transpose'
       */
      customDirective: string
      render: ({ self, directiveValue }) => ReactElement
    })

const defaults: Opts = {
  id: 'transpose'
}

export const transpose =
  (_opts: Opts = {}) =>
  (WrappedComponent) => {
    const opts = { ...defaults, ..._opts }

    return beyond(WrappedComponent, {
      id: opts.id,
      directiveProp: ['x-transpose'].concat(opts.customDirective || []),
      mapElement: (el, directiveValue) => {
        if (!React.isValidElement(el)) {
          return el
        }

        const [transposeVal, customVal] = directiveValue

        const wrapperEl = opts.render
          ? opts.render({
              self: el,
              directiveValue: customVal
            })
          : transposeVal(el)

        return createElement(wrapperEl.type, {
          ...wrapperEl.props,
          ...(!refAsProp && el.ref && { key: el.ref }),
          ...(el.key && { key: el.key })
        })
      }
    })
  }
