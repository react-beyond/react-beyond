import React, { FC, useCallback } from 'react'
import { $deephocInfo, deepHoc } from 'react-deephoc'
import { ErrorBoundary } from 'react-error-boundary'

declare module 'react' {
  interface Attributes {
    'x-error-fallback'?: ClassValue
  }
}

type Opts = {
  id?: string
  forAll?: boolean
  defaultFallback?: (componentName: string) => React.ReactNode
}

const factoryDefaultFallback = (name: string) => (
  <div
    style={{
      display: 'grid',
      alignItems: 'center',
      textAlign: 'center',
      width: '100%',
      height: '100%',
      opacity: 0.4
    }}
  >
    [{name} error]
  </div>
)

export const deepErrorBoundary =
  (opts: Opts = {}) =>
  (WrappedComponent: FC) => {
    return deepHoc(WrappedComponent, {
      id: opts.id || 'errorBoundary',
      mapElement: (el) => {
        if (typeof el.type === 'string') {
          return el
        }

        const prop = 'x-error-fallback'
        const forAll = opts.forAll !== false

        if (!Object.hasOwn(el.props, prop) && !forAll) {
          return el
        }

        const name = el.type?.[$deephocInfo]?.baseName || el.type.name

        const { [prop]: omitted, ...props } = el.props
        const ref = el.ref
        const key = el.key

        const defaultFallback =
          typeof opts.defaultFallback === 'function'
            ? opts.defaultFallback(name)
            : opts.defaultFallback
            ? opts.defaultFallback
            : factoryDefaultFallback(name)

        const fallback =
          el.props[prop] === true
            ? defaultFallback
            : typeof el.props[prop] === 'function'
            ? el.props[prop](name)
            : el.props[prop] || defaultFallback

        return (
          <ErrorBoundary {...(key && { key })} fallback={fallback}>
            {createElement(el.type, {
              ...props,
              ...(ref && { ref })
            })}
          </ErrorBoundary>
        )
      }
    })
  }

export const DeepErrorBoundary = function DeepErrorBoundary(props: Opts) {
  const inner = useCallback(function DeepErrorBoundary(props) {
    return props.children
  }, [])

  return deepErrorBoundary(props)(inner)
}
