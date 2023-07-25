import React, { FC, ReactElement, createElement, useCallback } from 'react'
import { $$beyondInfo, beyond } from 'react-beyond'

// <th class={tdCls[0]} x-foreach={columns}>
//   %value[1]%
// </th>

// {keys(catMap).map((nr) => (
//   <tr key={nr} class="flex w-full">
//     <td class={tdCls[0]}>{nr}</td>
//     <td class={tdCls[1]}>{getKeyLabel(catMap[nr])}</td>
//     <td class={tdCls[2]}>{getValue(catMap[nr])}</td>
//     <td class={tdCls[3]}>{getValue(`${catMap[nr]}Comment`)}</td>
//   </tr>
// ))}

// <tr class="flex w-full" x-foreach={keys(catMap)}>
//   <td class={tdCls[0]}>%#%</td>
//   <td class={tdCls[1]}>%getKeyLabel(catMap[#])%</td>
//   <td class={tdCls[2]}>%getValue(catMap[#])%</td>
//   <td class={tdCls[3]}>%getValue(catMap[#] + 'Comment')%</td>
// </tr>

// <tr class="flex w-full" x-foreach={keys(catMap)}>
//   <td class={tdCls[0]}>{x => x}</td>
//   <td class={tdCls[1]}>{x => getKeyLabel(catMap[x])}</td>
//   <td class={tdCls[2]}>{x => getValue(catMap[x])}</td>
//   <td class={tdCls[3]}>{x => getValue(catMap[x] + 'Comment')}</td>
// </tr>

declare module 'react' {
  interface Attributes {
    /**
     * The fallback to render when an error occurs, or `true` to use the
     * default fallback.
     */
    'x-foreach'?: Array<any>
  }
}

type Opts = {
  /**
   * The id of the hoc. Must be unique.
   * @default 'forEach'
   */
  id?: string
}

const defaults: Opts = {
  id: 'forEAch',
}

export const forEach =
  (_opts: Opts = {}) =>
  (WrappedComponent: FC) => {
    const opts = { ...defaults, ..._opts }
    const prop = 'x-foreach'

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

    return beyond(WrappedComponent, {
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
            render?.[$$beyondInfo]?.baseName || render.displayName || render.name

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
          el.type?.[$$beyondInfo]?.baseName ||
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

export const ErrorFallback = function ErrorFallback(props: Opts) {
  const inner = useCallback(function ErrorFallback(props) {
    return props.children
  }, [])

  return errorFallback(props)(inner)
}
