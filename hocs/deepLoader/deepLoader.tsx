import React, {
  ReactElement,
  createElement,
  useCallback,
  useRef,
  useState
} from 'react'
import { deepHoc } from 'react-deephoc'
import { useLayoutEffect } from 'react'

declare module 'react' {
  interface Attributes {
    'x-loader'?: boolean
  }
}

const LoaderMask = function LoaderMask(props) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'clip',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <span>Loading...</span>
    </div>
  )
}

type DisplayDetectorProps = {
  children: React.ReactElement
  loader?: boolean
  loaderMask?: React.ReactElement
}

const DisplayDetector = ({
  children,
  loader,
  loaderMask
}: DisplayDetectorProps) => {
  const ref = useRef(null)
  const [display, setDisplay] = useState('none')

  useLayoutEffect(() => {
    if (ref.current && ref.current.firstChild) {
      const computedDisplay = window.getComputedStyle(
        ref.current.firstChild
      )?.display
      setDisplay(computedDisplay)
    }
  }, [display])

  return (
    <div style={{ position: 'relative', display }}>
      <div
        ref={ref}
        style={{
          position: 'relative',
          zIndex: 0,
          visibility: loader ? 'hidden' : 'visible',
          // visibility doesn't guarantee that children are not visible in CSS
          // so let's force it with opacity too...
          opacity: loader ? 0 : 1,
          display
        }}
      >
        {children}
      </div>
      {loader && (loaderMask || <LoaderMask />)}
    </div>
  )
}

type Opts = {
  /**
   * The id of the hoc. Must be unique.
   * @default 'deepLoader'
   */
  id?: string

  /**
   * The loader mask to display when the loader is active.
   * @default A `<div>` covering the area of the wrapped component with a
   * "Loading..." text in the center.
   */
  loaderMask?: ReactElement
}

export const deepLoader =
  (opts: Opts = {}) =>
  (WrappedComponent) => {
    return deepHoc(WrappedComponent, {
      id: opts.id || 'deepLoader',
      directiveProp: 'x-loader',
      mapElement: (el, directiveValue) => {
        return (
          <DisplayDetector loader={directiveValue} loaderMask={opts.loaderMask}>
            {el}
          </DisplayDetector>
        )
      }
    })
  }

export const DeepLoader = function DeepLoader(props: Opts) {
  const inner = useCallback(function DeepLoader(props) {
    return props.children
  }, [])

  return deepLoader(props)(inner)
}
