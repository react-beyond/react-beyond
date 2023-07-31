import { FC } from 'react'
import { beyond } from 'react-beyond'

type Opts =
  | ((cmp: FC) => FC)
  | {
      /**
       * The id of the hoc. Must be unique.
       * @default 'hoc'
       */
      id?: string
      hoc: (cmp: FC) => FC
    }

export const hoc = (opts: Opts) => (WrappedComponent) => {
  const fn = typeof opts === 'function' ? opts : opts.hoc
  const id = typeof opts === 'function' ? 'hoc' : opts.id || 'hoc'

  return beyond(WrappedComponent, { id, mapComponent: fn })
}
