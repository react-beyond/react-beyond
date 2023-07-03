import { deepHoc } from 'react-deephoc'

export function deepValtio(WrappedComponent) {
  return deepHoc(WrappedComponent, {
    id: 'deepValtio',
    invokeRender(Cmp, props, ref) {}
  })
}

export const DeepValtio = deepValtio(function DeepValtio(props) {
  return props.children
})
