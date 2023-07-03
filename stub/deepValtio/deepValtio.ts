
export function deepValtio(WrappedComponent) {
  return beyond(WrappedComponent, {
    id: 'deepValtio',
    invokeRender(Cmp, props, ref) {}
  })
}

export const DeepValtio = deepValtio(function DeepValtio(props) {
  return props.children
})
