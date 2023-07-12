import React, {
  ComponentClass,
  ComponentType,
  FC,
  ForwardRefExoticComponent,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  Ref,
  createElement,
  forwardRef,
  memo
} from 'react'
import { createPortal } from 'react-dom'

export const $$beyondInfo = Symbol('beyond-info')

const memoType = memo(() => null)
const forwardRefType = forwardRef(() => null)

// We can't use document here, because it's not available during SSR
// const portalType = createPortal(null, document.body)

// Map from wrapped component to hoc
const cache = new Map()

// Map from base component to { path, hocStack}
// Must be a window global...
// const hmrMap = new Map()

/**
 * Get the display name of a component
 * @param {FC} WrappedComponent - The component to get the display name from
 * @returns {string} The display name of the component
 */
function getDisplayName(
  WrappedComponent: ComponentType | ForwardRefExoticComponent<unknown> | any
) {
  return (
    WrappedComponent.displayName ||
    WrappedComponent.name ||
    // forwardRef
    WrappedComponent?.render?.name ||
    WrappedComponent?.render?.displayName ||
    // memo
    WrappedComponent?.type?.name ||
    WrappedComponent?.type?.displayName ||
    'UnknownComponentName'
  )
}

function isClassComponent(
  Render: ComponentType | string | any
): Render is ComponentClass {
  return Render.prototype && Render.prototype.isReactComponent
}

function applyHocToVdom(opts: BeyondOptions) {
  return function (
    element: React.ReactElement<PropsWithChildren> | any
  ): React.ReactElement {
    if (!element) {
      return element
    }

    if (Array.isArray(element)) {
      return element.map(applyHocToVdom(opts))
    }

    if (String(element?.$$typeof) === 'Symbol(react.portal)') {
      return createPortal(
        React.Children.map(element.children, applyHocToVdom(opts)),
        element.containerInfo,
        element.key
      )
    }

    // This must be after the portal check above
    if (!React.isValidElement(element)) {
      return element
    }

    // Check if the element was already visited
    let beyondInfo = element?.type?.[$$beyondInfo]
    while (beyondInfo) {
      if (beyondInfo.opts.id === opts.id) {
        return element
      }
      beyondInfo = beyondInfo.wrappedComponent[$$beyondInfo]
    }

    let childrenWithHoc = applyHocToVdom(opts)(element.props.children)

    if (opts.mapChildren) {
      childrenWithHoc = opts.mapChildren(childrenWithHoc)
    }

    let elWithHoc = React.cloneElement(
      element,
      element.props,
      // Need to spread one level in order to reproduce the original usage.
      // Otherwise "Each child in a list should have a unique "key" prop."
      // warnings pop up all around, because element.props.children is already
      // array-ified by the pragma (if there are multiple child nodes). An
      // alternative would be ...(childrenWithHoc || []) which would need
      // childrenWithHoc = React.Children.map(element.props.children,
      // applyHocToVdom(opts)) above, but React.Children.map pollutes the tree
      // with generated keys.
      ...[].concat(childrenWithHoc || [])
    )

    // @ts-ignore
    const ref = element.ref
    const key = element.key

    if (
      typeof element.type === 'function' ||
      element?.type?.$$typeof === forwardRefType.$$typeof ||
      element?.type?.$$typeof === memoType.$$typeof
    ) {
      elWithHoc = React.createElement(
        beyond(element.type, opts),
        {
          ...elWithHoc.props,
          ...(ref && { ref }),
          ...(key && { key })
        },
        // Need to spread one level for the same reason as above
        ...[].concat(childrenWithHoc || [])
      )
    }

    // Handle directives
    const directiveValues = []

    if (opts.directiveProp) {
      const directiveProps = [].concat(opts.directiveProp)
      let propsWithoutDirective = elWithHoc.props
      let directivePropPresent = false
      let omit

      for (const directiveProp of directiveProps) {
        directiveValues.push(elWithHoc.props[directiveProp])
        if (Object.hasOwn(elWithHoc.props, directiveProp)) {
          directivePropPresent = true
          ;({ [directiveProp]: omit, ...propsWithoutDirective } =
            propsWithoutDirective)
        }
      }

      if (!directivePropPresent) {
        return elWithHoc
      }

      elWithHoc = React.createElement(elWithHoc.type, {
        ...propsWithoutDirective,
        ...(ref && { ref }),
        ...(key && { key })
      })
    }

    if (opts.mapElement) {
      elWithHoc = opts.mapElement(
        elWithHoc,
        ...(!opts.directiveProp
          ? []
          : typeof opts.directiveProp === 'string'
          ? [directiveValues[0]]
          : [directiveValues])
      )
    }

    return elWithHoc
  }
}

function invokeRender(render, optsInvokeRender, props, ref) {
  if (optsInvokeRender) {
    return optsInvokeRender(render, props, ref)
  }

  return render(props, ref)
}

export type BeyondOptions = {
  id: string
  invokeRender?: (
    Cmp: FC,
    props: PropsWithChildren,
    ref?: Ref<any>
  ) => ReactElement
  mapComponent?: (Cmp: FC) => FC
  directiveProp?: string
  mapElement?: (element: ReactElement, directiveValue?: any) => ReactElement
  mapChildren?: (elements: ReactNode | ReactNode[]) => ReactElement[]
}

/**
 * A deep higher-order component (HOC) utility function that applies itself
 * recursively to all children, even penetrating through renders.
 * @param {ComponentType} wrappedComponent - The component to wrap
 * @param {BeyondOptions} opts - The options for the HOC
 * @returns {ComponentType} The wrapped component
 */
export function beyond<FC extends ComponentType>(
  wrappedComponent: FC,
  opts: BeyondOptions
): FC {
  // id will mostly remain the same. But some HOCs can use it to generate a new
  // id to invalidate the tree - e.g., state-related HOCs -; although, this
  // strategy is not too promising: it's slow, and all the inner hook states
  // will be reset in the components, as they'll be entirely new components to
  // react.
  if (
    cache.has(wrappedComponent) &&
    cache.get(wrappedComponent).opts.id === opts.id
  ) {
    return cache.get(wrappedComponent).hoc
  }

  // Get the unwrapped base component from forwardRef and memo wrappings
  const wrappers = []
  let render: any = wrappedComponent

  while (
    render?.$$typeof === forwardRefType.$$typeof ||
    render?.$$typeof === memoType.$$typeof
  ) {
    if (render?.$$typeof === forwardRefType.$$typeof) {
      wrappers.push({ type: 'forwardRef', cmp: render })
      render = render.render
    } else if (render?.$$typeof === memoType.$$typeof) {
      wrappers.push({ type: 'memo', cmp: render })
      render = render.type
    }
  }

  if (isClassComponent(render)) {
    return wrappedComponent
  }

  let hoc: any = function Beyond(props, ref) {
    const vdom = invokeRender(render, opts.invokeRender, props, ref)
    return applyHocToVdom(opts)(vdom)
  }

  const hocRender = hoc

  // Re-wrap the render function in forwardRef and memo
  for (let i = wrappers.length - 1; i >= 0; i--) {
    if (wrappers[i].type === 'forwardRef') {
      hoc = forwardRef(hoc)
    } else if (wrappers[i].type === 'memo') {
      hoc = memo(hoc, wrappers[i].cmp.compare)
    }
  }

  if (opts.mapComponent) {
    hoc = opts.mapComponent(hoc)
  }

  // Unwrap the base component from all the deep hocs and get a flat displayName
  // of the hoc chain
  let hocsDisplayName = opts.id
  let baseCmp = wrappedComponent

  while (baseCmp[$$beyondInfo]) {
    hocsDisplayName = `${baseCmp[$$beyondInfo].opts.id} < ${hocsDisplayName}`
    baseCmp = baseCmp[$$beyondInfo].wrappedComponent
  }

  hoc.displayName = `${hocsDisplayName}(${getDisplayName(baseCmp)})`

  const baseName = getDisplayName(baseCmp)

  const info = {
    wrappedComponent,
    hoc,
    opts,
    baseName
  }

  // hoc now = hoc with forwardRef and memo wrappings restored
  // This is the needed piece for the mechanism of tracking the hoc chain
  hoc[$$beyondInfo] = info

  // This is only needed in custom invokeRenders, where the callback needs the
  // base component name. That callback operates on the unwrapped render
  // function, so it couldn't look up the [$$beyondInfo] record to get the
  // baseName.
  hocRender[$$beyondInfo] = info

  cache.set(wrappedComponent, info)

  // Fast refresh (HMR) support. It needs the react-beyond/plugin/vite to be
  // installed.
  if (import.meta.hot && window.__BEYOND_GLOBAL__) {
    // setTimeout is needed when the component imports come earlier than the
    // beyond import. E.g.: import App from "./App"; import { Beyonds } from
    // "react-beyond"; In this case, control gets here before the first
    // RefresRuntime.register() call, and there's no chance to get the id of the
    // base component. As HMR registration is not crucial to be synchronous, so
    // we can defer it to work the problem around.
    setTimeout(() => {
      const beyondGlobal = window.__BEYOND_GLOBAL__

      if (!beyondGlobal.cmpToIds) {
        console.error(
          "Beyond: Can't find the component/id map. Did you forget to install the react-beyond/plugin/vite plugin?"
        )
        return
      }

      // Get the id of the original base component
      const ids = beyondGlobal.cmpToIds.get(baseCmp)

      if (ids) {
        const id = ids[0]

        // If we're during an HMR HOC reapplication, skip re-adding to the HOC
        // stack
        if (!beyondGlobal.isReapplication) {
          const hocs = beyondGlobal.idToHocs.get(id)
          if (hocs) {
            hocs.push(info)
          }
        }

        beyondGlobal.originalRegister(hoc, id + ' ' + hocsDisplayName)
      }
    })
  }

  return cache.get(wrappedComponent).hoc
}

/**
 * Use it like this:
 *   <Beyonds hocs={[deepClassFor, deepLoader, deepTryCatch]}>
 *     <App />
 *   </Beyonds>
 */
export function Beyond(props: { children: ReactNode; features: Function[] }) {
  let Children = function Children() {
    return props.children
  }

  for (const feature of props.features) {
    Children = feature(Children)
  }

  return createElement(Children)
}

if (import.meta.hot && window.__BEYOND_GLOBAL__) {
  Object.assign(window.__BEYOND_GLOBAL__, { beyond })
}
