import {
  createElement,
  Fragment,
  useCallback,
  useLayoutEffect,
  useRef
} from 'react'

export function deepState(WrappedComponent, initialState, id) {
  const _id = `state-${id}`

  return beyond(WrappedComponent, {
    id: _id,
    mapElement: (el) => {
      if (typeof el.type === 'string' || el.type === Fragment) {
        return el
      }

      const propKey = state

      const _state = Object.assign({}, initialState, el.props[propKey])

      const ref = el.ref

      return createElement(el.type, {
        ...el.props,
        _state,
        ...(ref && { ref })
      })
    }
  })
}

function useEventCallback(fn) {
  const ref = useRef()
  useLayoutEffect(() => {
    ref.current = fn
  })
  return useCallback(() => (ref.current ?? fn)(), [])
}

let _id = 1

const wm = new WeakMap()

export const DeepState = function DeepState(outerProps) {
  let id
  if (wm.has(outerProps.state)) {
    id = wm.get(outerProps.state)
  }
  else {
    id = _id++
    wm.set(outerProps.state, id)
  }

  // const [id] = useState(() => _id++)

  const inner = useEventCallback(function DeepState() {
    return outerProps.children
  })

  return createElement(deepState(inner, outerProps.state, id))
}

export const state = '_state'

/*
  The current state of this deep hoc:
  - A sample usage is <DeepState state={{ state, setState }}>...</DeepState>
  - setState works, and it will update the source component, but not the
    subtree. The subtree will only be updated when we generate a new id. But
    generating a new id inevitably re-render the full subtree, which is a no-go
    for 2 important reasons:
    1. It's slow
    2. The subtree will have entirely new cmp references, so hook states will be
       lost

  So we wanna keep the id as stable as possible. We tie it to a non-setting
  useState. But it's not enough, because whenever a <DeepState> is re-mounted
  for whatever reason (e.g. a new Cmp reference returned from a hook, like
  PrintShadow is around one), it'll get a new id. Why? Because a new cmp
  reference will always produce new cmp references in its subtree. Is it a deal
  breaker? Sounds so, unfortunately. Resetting all the useStates in a subtree is
  totally unexpected behavior, so we really need that id stability. But it seems
  like it's as far as we can reach in terms of id stability with the <DeepState
  state={{}}>...</DeepState> syntax.

  An alternative would be to explicitely add some id from the app side:
  <DeepState state={{}} id="foo">...</DeepState>. But this is meh. It brings up
  collision issues.

  Another solution would be to tie DeepState hoc stability to the state ref
  stability, so it must be a ref - it leaves open the continuation towards
  proxies or maybe other stuff. We'll use a WeakMap for this.

  This seems to work. The ids are rock solid, and they withstand the react dev
  unmount-mount cycle too. Now we have to figure out how to update the state and
  notify the interested components. Updatig the state is easy with callbacks.
  Notifying the interested components is tricky. Again, we cannot touch the hoc
  id. First we have to figure out which components are interested.



*/
