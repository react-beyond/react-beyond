import clsx from 'clsx'
import React, {
  FC,
  forwardRef,
  ReactElement,
  useState
} from 'react'
import { beyond } from 'react-beyond'
import { Arrow, useLayer, UseLayerProps } from 'react-laag'
import { PlacementType } from 'react-laag/dist/PlacementType'

type ConfigObject = {
  placement?: PlacementType
  enabled?: boolean
  body:
    | ReactElement
    | ((params: {
        close: () => void
        Arrow: FC<{ class?: string; style?: React.CSSProperties }>
      }) => ReactElement)
}

type Falsy = false | undefined | null

declare module 'react' {
  interface Attributes {
    /**
     * The menu configuration.
     * - If a ReactElement, it will be rendered as the menu.
     * - If a function, it will be called with a `close` function as argument
     *   and must return a ReactElement.
     * - If any falsy value, the menu is disabled.
     * - If an object, it must have the following properties:
     *   - `placement`: the placement of the menu. This is a react-laag
     *     "placement" value. Default: 'bottom-center'.
     *   - `enabled`: whether the menu is enabled or not. Default: true.
     *   - `body`: the menu body. It can be a ReactElement or a function as
     *     detailed above.
     */
    'x-menu'?:
      | ReactElement
      | ((close: () => void) => ReactElement)
      | ConfigObject
      | Falsy
  }
}

// @ts-ignore
export function useContextMenu(isOpen, close, placement) {
  const layer = useLayer({
    isOpen,
    onOutsideClick: close,
    onDisappear: close,
    overflowContainer: false,
    auto: true,
    placement: placement || ('bottom-center' as const),
    triggerOffset: 12,
    containerOffset: 16,
    arrowOffset: 16
  })

  return layer
}

type Props = {
  placement?: PlacementType
  renderTrigger: (
    triggerProps: UseLayerProps['triggerProps'],
    open: boolean,
    onClick: () => void,
    ref: any
  ) => ReactElement
  body: ConfigObject['body']
}

const ArrowWithClass = (props) => {
  return (
    <Arrow
      // layer.arrowProps.ref causes an infinite render loop, would be good to
      // know why
      // {...layer.arrowProps}
      layerSide={layer.arrowProps.layerSide}
      className={props.class}
      style={{
        ...layer.arrowProps.style,
        ...props.style
      }}
    />
  )
}

export const MenuComponent = forwardRef(function Menu(props: Props, ref) {
  const [isOpen, setOpen] = useState(false)
  const close = () => setOpen(false)

  const layer = useContextMenu(isOpen, close, props?.placement)

  const TriggerCmp = () =>
    props.renderTrigger(layer.triggerProps, isOpen, () => setOpen(!isOpen), ref)

  const body = props.body
  const Body =
    typeof body === 'function'
      ? () => body({ close, Arrow: ArrowWithClass })
      : () => body

  return (
    <>
      <TriggerCmp />
      {layer.renderLayer(
        <div
          {...layer.layerProps}
          style={{
            ...layer.layerProps?.style,
            width: 'auto',
            zIndex: isOpen ? 10000 : -1,
            transitionProperty: 'opacity',
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            transitionDuration: '150ms',
            opacity: isOpen ? 1 : 0
          }}
        >
          <Body />
        </div>
      )}
    </>
  )
})

type Opts = {
  /**
   * The id of the hoc. Must be unique.
   * @default 'deepMenu'
   */
  id?: string
}

export const menu =
  (opts: Opts = {}) =>
  (WrappedComponent) => {
    return beyond(WrappedComponent, {
      id: opts.id || 'menu',
      directiveProp: 'x-menu',
      mapElement: (el, directiveValue) => {
        if (!directiveValue) {
          return el
        }

        const menu = directiveValue

        const ref = el.ref
        const key = el.key

        const Cmp = el.type

        const body = menu.body ?? menu
        const placement = menu.placement

        if (menu.enabled === false) {
          return el
        }

        return (
          <MenuComponent
            {...(key && { key })}
            renderTrigger={(triggerProps, open, onClick, ref) => {
              return (
                <Cmp
                  {...el.props}
                  {...(ref && { ref })}
                  {...triggerProps}
                  {...{
                    onClick,
                    className: clsx(el.props.className, open && 'active')
                  }}
                >
                  {el.props.children}
                </Cmp>
              )
            }}
            body={body}
            placement={placement}
          />
        )
      }
    })
  }
