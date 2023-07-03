import { transpose } from '@react-beyond/transpose'
import { ReactElement, useCallback } from 'react'

declare module 'react' {
  interface Attributes {
    'x-tooltip'?: string
  }
}

type Opts = {
  /**
   * The id of the hoc. Must be unique.
   * @default 'tooltip'
   */
  id?: string
  render: ({ self, directiveValue }) => ReactElement
}

export const tooltip = (opts: Opts) =>
  transpose({
    id: opts.id || 'tooltip',
    customDirective: 'x-tooltip',
    render: opts.render
  })

export const Tooltip = function Tooltip(props: Opts) {
  const inner = useCallback(function Tooltip(props) {
    return props.children
  }, [])

  return tooltip(props)(inner)
}
