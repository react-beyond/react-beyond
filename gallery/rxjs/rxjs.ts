import { createElement, useEffect, FC, useState, ReactNode } from 'react'
import { beyond } from 'react-beyond'
import { Observable } from 'rxjs'

declare module 'react' {
  interface DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_REACT_NODES {
    ObservableNode: Observable<ReactNode>
  }
}

type Opts =
  | ((cmp: FC) => FC)
  | {
      /**
       * The id of the hoc. Must be unique.
       * @default 'rxjs'
       */
      id?: string
      observableClass?: any
    }

const defaults: Opts = {
  id: 'rxjs',
  observableClass: Observable
}

function ObservableComponent(props: { stream: Observable<ReactNode> }) {
  const [state, setState] = useState(null)

  useEffect(() => {
    const subscription = props.stream.subscribe((value) => {
      setState(value)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [props.stream])

  return state
}

export const rxjs =
  (_opts = {}) =>
  (WrappedComponent) => {
    const opts = { ...defaults, ..._opts }
    const observableClass = opts.observableClass || Observable

    return beyond(WrappedComponent, {
      id: opts.id,

      mapNode: (node) => {
        if (node instanceof observableClass) {
          return createElement(ObservableComponent, { stream: node })
        }
        return node
      }
    })
  }
