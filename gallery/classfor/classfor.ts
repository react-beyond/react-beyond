import clsx from 'clsx'
import { createElement } from 'react'
import { beyond } from 'react-beyond'

declare module 'react' {
  interface Attributes {
    class?: string
  }
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    for?: string
  }
}

type Opts = {
  /**
   * The id of the hoc. Must be unique.
   * @default 'classFor'
   */
  id?: string

  /**
   * If false, it will change the class prop to className on components too, not
   * just DOM elements. Note: for -> htmlFor change is only applied to DOM
   * elements, not matter of what this option is set to.
   * @default true
   */
  onlyDom?: boolean

  /**
   * If true, it will apply clsx() on the class value. Note that using it
   * is questionable, as the typing of the class prop is string. If you want to
   * use clsx, you have to declare the typing yourself. Example:
   * ```tsx
   * import type { ClassValue } from 'clsx'
   * declare module 'react' {
   *   interface Attributes {
   *     class?: ClassValue
   *   }
   * }
   * ```
   * Or you can use the clsx feature, which provides an `x-clsx` directive with
   * clsx typing.
   *
   * @default false
   */
  clsx?: boolean
}

const defaults: Opts = {
  id: 'classFor',
  onlyDom: true,
  clsx: false
}

export const classFor =
  (_opts: Opts = {}) =>
  (WrappedComponent) => {
    const opts = { ...defaults, ..._opts }

    return beyond(WrappedComponent, {
      id: opts.id,
      // Can't use directiveProp here, because these props need to appear on
      // components ('for' always, 'class' when onlyDom is false)
      // directiveProp: ['class', 'for'],
      mapElement: (el, directiveValue) => {
        const isDom = typeof el.type === 'string'

        if (Object.hasOwn(el.props, 'class') && (isDom || !opts.onlyDom)) {
          const classVal = opts.clsx ? clsx(el.props.class) : el.props.class
          const { class: omitted, ...props } = el.props

          el = createElement(el.type, {
            ...props,
            ...(el.ref && { ref: el.ref }),
            ...(el.key && { key: el.key }),
            // The original react behavior is that class overrides className,
            // when it is not undefined or null. We want to preserve that
            // behavior. Although, clsx() will return an empty string in case of
            // null/undefined, but that's the user's responsibility.
            ...(classVal != null && { className: classVal })
          })
        }

        if (Object.hasOwn(el.props, 'for') && isDom) {
          const forVal = el.props.for
          const { for: omitted, ...props } = el.props

          el = createElement(el.type, {
            ...props,
            ...(el.ref && { ref: el.ref }),
            ...(el.key && { key: el.key }),
            ...(forVal != null && { htmlFor: forVal })
          })
        }

        return el
      }
    })
  }
