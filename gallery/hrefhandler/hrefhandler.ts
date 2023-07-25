import { cloneElement } from 'react'
import { beyond } from 'react-beyond'

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    href?: string
  }
}

type Opts = {
  /**
   * The id of the hoc. Must be unique.
   * @default 'hrefHandler'
   */
  id?: string

  /**
   * This function will be called when the user clicks on a link.
   */
  navigate: (href: string) => void

  /**
   * If true, it will only handle relative links.
   * @default true
   */
  onlyRelative?: boolean
}

const defaults: Partial<Opts> = {
  id: 'hrefHandler',
  onlyRelative: true
}

export const hrefHandler = (_opts: Opts) => (WrappedComponent) => {
  const opts = { ...defaults, ..._opts }

  return beyond(WrappedComponent, {
    id: opts.id,
    mapElement: (el) => {
      if (
        el.type !== 'a' ||
        !Object.hasOwn(el.props, 'href') ||
        (opts.onlyRelative && /^(?:\w+:)?\/\//.test(el.props.href))
      ) {
        return el
      }

      return cloneElement(el, {
        onClick:
          el.props.onClick ||
          ((e) => {
            e.preventDefault()
            opts.navigate(el.props.href)
          })
      })
    }
  })
}
