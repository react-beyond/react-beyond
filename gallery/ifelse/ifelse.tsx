import React, { createElement } from 'react'
import { beyond } from 'react-beyond'

declare module 'react' {
  interface Attributes {
    /**
     * If true, the element will be rendered, otherwise a `<></>` will be in its
     * place.
     */
    'x-if'?: boolean

    /**
     * It can be used as an `else if` case for a preceding `x-if` or
     * `x-else-if`. If there's no preceding `x-if` or `x-else-if`, an error will
     * be thrown.
     */
    'x-else-if'?: boolean

    /**
     * It can be used as an `else` case for a preceding `x-if` or `x-else-if`.
     * If there's no preceding `x-if` or `x-else-if`, an error will be thrown.
     */
    'x-else'?: true
  }
}

type Opts = {
  /**
   * The id of the hoc. Must be unique.
   * @default 'ifElse'
   */
  id?: string
}

const defaults: Opts = {
  id: 'ifElse'
}

export const ifElse =
  (_opts: Opts = {}) =>
  (WrappedComponent) => {
    const opts = { ...defaults, ..._opts }

    return beyond(WrappedComponent, {
      id: opts.id,
      mapChildren: (children) => {
        const isArray = Array.isArray(children)
        const result = []
        const elements = [].concat(children)

        let state: 'idle' | 'if-true' | 'if-false'

        for (let i = 0; i < elements.length; i++) {
          const el = elements[i]

          if (!React.isValidElement(el)) {
            result.push(el)
            continue
          }

          const {
            ['x-if']: ifVal,
            ['x-else-if']: elseIfVal,
            ['x-else']: elseVal,
            ...props
          } = el.props

          const newEl = createElement(el.type, {
            ...props,
            ...(el.ref && { ref: el.ref }),
            ...(el.key && { key: el.key })
          })

          if (Object.hasOwn(el.props, 'x-if')) {
            result.push(ifVal ? newEl : <></>)
            state = ifVal ? 'if-true' : 'if-false'
            continue
          }

          if (Object.hasOwn(el.props, 'x-else-if')) {
            if (state === 'idle') {
              throw new Error(
                '"ifElse: x-else-if" found on an element, but the previous element has no "x-if" or "x-else-if"'
              )
            } else {
              result.push(state === 'if-false' && elseIfVal ? newEl : <></>)
              state = state === 'if-true' || elseIfVal ? 'if-true' : 'if-false'
              continue
            }
          }

          if (Object.hasOwn(el.props, 'x-else')) {
            if (state === 'idle') {
              throw new Error(
                '"ifElse: x-else" found on an element, but the previous element has no "x-if" or "x-else-if"'
              )
            } else {
              result.push(state === 'if-false' ? newEl : <></>)
              state = 'idle'
              continue
            }
          }

          state = 'idle'

          result.push(newEl)
        }

        return isArray ? result : result[0]
      }
    })
  }
