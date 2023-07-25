import { observer } from 'mobx-react-lite'
import { memo } from 'react'
import { beyond } from 'react-beyond'

const memoType = memo(() => null)

function isClassComponent(Render) {
  return Render.prototype && Render.prototype.isReactComponent
}

type Opts = {
  /**
   * The id of the hoc. Must be unique.
   * @default 'mobx'
   */
  id?: string
}

export const mobx =
  (opts: Opts = {}) =>
  (WrappedComponent) => {
    return beyond(WrappedComponent, {
      id: opts.id || 'mobx',
      mapComponent(cmp) {
        if (isClassComponent(cmp)) {
          return cmp
        }

        if (cmp.$$typeof === memoType.$$typeof) {
          return memo(observer(cmp.type), cmp.compare)
        }

        return observer(cmp)
      }
    })
  }
