import { transpose } from '@react-beyond/transpose'
import { ReactElement } from 'react'

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
