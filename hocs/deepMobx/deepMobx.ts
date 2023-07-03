import { observer } from 'mobx-react-lite'
import { memo } from 'react'
import { deepHoc } from 'react-deephoc'

const memoType = memo(() => null)

function isClassComponent(Render) {
  return Render.prototype && Render.prototype.isReactComponent
}

type Opts = {
  /**
   * The id of the hoc. Must be unique.
   * @default 'deepMobx'
   */
  id?: string
}

export const deepMobx =
  (opts: Opts = {}) =>
  (WrappedComponent) => {
    return deepHoc(WrappedComponent, {
      id: opts.id || 'deepMobx',
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

export const DeepMobx = deepMobx()(function DeepMobx(props) {
  return props.children
})
