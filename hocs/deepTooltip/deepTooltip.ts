import { ReactElement, createElement, useCallback } from 'react'
import { deepHoc } from 'react-deephoc'
import { deepTranspose } from '@react-deephoc/transpose'

declare module 'react' {
  interface Attributes {
    'x-tooltip'?: string
  }
}

type Opts = {
  /**
   * The id of the hoc. Must be unique.
   * @default 'deepTooltip'
   */
  id?: string
  render: ({ self, directiveValue }) => ReactElement
}

export const deepTooltip = (opts: Opts) =>
  deepTranspose({
    id: opts.id || 'deepTooltip',
    customDirective: 'x-tooltip',
    render: opts.render
  })

export const DeepTooltip = function DeepTooltip(props: Opts) {
  const inner = useCallback(function DeepTooltip(props) {
    return props.children
  }, [])

  return deepTooltip(props)(inner)
}
