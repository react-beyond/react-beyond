import React, { cloneElement } from 'react'
import { beyond } from 'react-beyond'

declare module 'react' {
  interface Attributes {
    /**
     * A callback which receives an index value, and returns with an object which
     * gets applied to all of the children elements.
     */
    'x-on-children'?: (index: number) => Record<string, any>
  }
}

type Opts = {
  /**
   * The id of the hoc. Must be unique.
   * @default 'onChildren'
   */
  id?: string
}

const defaults: Opts = {
  id: 'onChildren'
}

export const onChildren =
  (_opts: Opts = {}) =>
  (WrappedComponent) => {
    const opts = { ...defaults, ..._opts }

    return beyond(WrappedComponent, {
      id: opts.id,
      directiveProp: 'x-on-children',
      mapElement: (el, directiveValue) => {
        if (
          !directiveValue ||
          !el.props.children ||
          el.props.children?.length === 0
        ) {
          return el
        }

        const onChildrenCallback = directiveValue

        const children = [].concat(el.props.children)
        const newChildren = children.map((child, index) => {
          return React.cloneElement(child, onChildrenCallback(index))
        })

        return cloneElement(el, el.props, ...[].concat(newChildren))
      }
    })
  }
