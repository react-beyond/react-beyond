import {
  createElement,
  useCallback,
  AriaAttributes,
  DOMAttributes,
  cloneElement
} from 'react'
import { deepHoc } from 'react-deephoc'

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    href?: string
  }
}

type Opts = {
  /**
   * The id of the hoc. Must be unique.
   * @default 'deepHrefHandler'
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
  id: 'deepHrefHandler',
  onlyRelative: true
}

export const deepHrefHandler = (_opts: Opts) => (WrappedComponent) => {
  const opts = { ...defaults, ..._opts }

  return deepHoc(WrappedComponent, {
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

export const DeepHrefHandler = function DeepHrefHandler(props: Opts) {
  const inner = useCallback(function DeepHrefHandler(props) {
    return props.children
  }, [])

  return deepHrefHandler(props)(inner)
}
