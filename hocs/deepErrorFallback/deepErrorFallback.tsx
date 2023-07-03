import React, { FC, ReactElement, createElement, useCallback } from 'react'
import { $deephocInfo, deepHoc } from 'react-deephoc'
import { ErrorBoundary } from 'react-error-boundary'

declare module 'react' {
  interface Attributes {
    /**
     * The fallback to render when an error occurs, or `true` to use the
     * default fallback.
     */
    'x-error-fallback'?:
      | true
      | ReactElement
      | ((componentName: string) => ReactElement)
  }
}

type Opts = {
  /**
   * The id of the hoc. Must be unique.
   * @default 'deepErrorFallback'
   */
  id?: string

  /**
   * Whether to apply error handling to all components or only to those that
   * have the `x-error-fallback` prop.
   * @default true
   */
  forAll?: boolean

  /**
   * The mode of error handling.
   * - `trycatch`: uses a try/catch block when rendering the component.
   * - `errorboundary`: wraps the component in an `<ErrorBoundary />` component
   *   (using the react-error-boundary library).
   * @default 'trycatch'
   */
  mode?: 'trycatch' | 'errorboundary'

  /**
   * The default fallback to render when an error occurs.
   * - If `true`, it uses the default fallback.
   * - If a function, it's a render function which gets the component name as
   *   its argument.
   * - If a ReactElement, it uses that element as the default fallback.
   * @default (name) => <div>[{name} error]</div>
   */
  defaultFallback?: ReactElement | ((componentName: string) => ReactElement)
}

const defaults: Opts = {
  id: 'deepErrorFallback',
  forAll: true,
  mode: 'trycatch',
  defaultFallback: (name: string) => (
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
}

export const deepErrorFallback =
  (_opts: Opts = {}) =>
  (WrappedComponent: FC) => {
    const opts = { ...defaults, ..._opts }
    const prop = 'x-error-fallback'

    function getFallbackEl(name: string, directiveValue) {
      const defaultFallback =
        typeof opts.defaultFallback === 'function'
          ? opts.defaultFallback(name)
          : opts.defaultFallback

      const fallback =
        directiveValue === true
          ? defaultFallback
          : typeof directiveValue === 'function'
          ? directiveValue(name)
          : directiveValue || defaultFallback

      return fallback
    }

    return deepHoc(WrappedComponent, {
      id: opts.id,
      invokeRender: (render, props, ref) => {
        const { [prop]: omitted, ...propsWithoutDirective } = props

        if (
          opts.mode === 'errorboundary' ||
          (!Object.hasOwn(props, prop) && !opts.forAll)
        ) {
          return render(propsWithoutDirective, ref)
        }

        try {
          return render(propsWithoutDirective, ref)
        } catch (error) {
          console.error(error)

          const name =
            render?.[$deephocInfo]?.baseName || render.displayName || render.name

          return getFallbackEl(name, props[prop])
        }
      },
      mapElement: (el) => {
        if (
          opts.mode === 'trycatch' ||
          typeof el.type === 'string' ||
          (!Object.hasOwn(el.props, prop) && !opts.forAll)
        ) {
          return el
        }

        const name =
          el.type?.[$deephocInfo]?.baseName ||
          el.type.displayName ||
          el.type.name

        const fallback = getFallbackEl(name, el.props[prop])

        const { [prop]: omitted, ...props } = el.props
        const ref = el.ref
        const key = el.key

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

export const DeepErrorFallback = function DeepErrorFallback(props: Opts) {
  const inner = useCallback(function DeepErrorFallback(props) {
    return props.children
  }, [])

  return deepErrorFallback(props)(inner)
}
