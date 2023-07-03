import React, { ReactElement, createElement, useCallback } from 'react'
import { deepHoc } from 'react-deephoc'

declare module 'react' {
  interface Attributes {
    'x-transpose'?: (self: ReactElement) => ReactElement
  }
}

type BaseOpts = {
  /**
   * The id of the hoc. Must be unique.
   * @default 'deepTranspose'
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
  id: 'deepTranspose'
}

export const deepTranspose =
  (_opts: Opts = {}) =>
  (WrappedComponent) => {
    const opts = { ...defaults, ..._opts }

    return deepHoc(WrappedComponent, {
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
          ...(el.key && { key: el.key })
        })
      }
    })
  }

export const DeepTranspose = function DeepTranspose(props: Opts) {
  const inner = useCallback(function DeepTranspose(props) {
    return props.children
  }, [])

  return deepTranspose(props)(inner)
}
