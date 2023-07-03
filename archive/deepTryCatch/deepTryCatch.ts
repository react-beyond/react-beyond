import { FC, createElement, useCallback } from 'react'
import { $$beyondInfo } from 'react-beyond'

const factoryDefaultFallback = (name: string) =>
  createElement(
    'div',
    {
      style: {
        display: 'grid',
        alignItems: 'center',
        textAlign: 'center',
        width: '100%',
        height: '100%',
        opacity: 0.4
      }
    },
    '[' + name + ' error]'
  )

type Opts = {
  id?: string
  forAll?: boolean
  defaultFallback?: (componentName: string) => React.ReactNode
}

export const deepTryCatch =
  (opts: Opts = {}) =>
  (WrappedComponent: FC) => {
    return beyond(WrappedComponent, {
      id: opts.id || 'deepTryCatch',
      invokeRender: (render, props, ref) => {
        const prop = 'x-error-fallback'
        const forAll = opts.forAll !== false

        const { [prop]: omitted, ...propsWithoutDirective } = props

        if (!Object.hasOwn(props, prop) && !forAll) {
          return render(propsWithoutDirective, ref)
        }

        try {
          return render(propsWithoutDirective, ref)
        } catch (error) {
          console.error(error)

          const name = render?.[$$beyondInfo]?.baseName || render.name

          const defaultFallback =
            typeof opts.defaultFallback === 'function'
              ? opts.defaultFallback(name)
              : opts.defaultFallback
              ? opts.defaultFallback
              : factoryDefaultFallback(name)

          const fallback =
            props[prop] === true
              ? defaultFallback
              : typeof props[prop] === 'function'
              ? props[prop](name)
              : props[prop] || defaultFallback

          return fallback
        }
      }
    })
  }

export const DeepTryCatch = function DeepTryCatch(props: Opts) {
  const inner = useCallback(function DeepTryCatch(props) {
    return props.children
  }, [])

  return deepTryCatch(props)(inner)
}
