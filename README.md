# react-beyond

React Beyond lets you define higher-order components which recursively re-apply themselves on the child components. You can create features that are available to the entire tree. It opens up new exciting possibilities in React to create more intuitive code.

## Important note on React 19

react-beyond@1.1.1 supports React 19 and below. The example modules from the [Gallery](https://react-beyond.github.io/gallery) are version-synced with the main module, and they're React 19 ready too. But they're not backward compatible with React 18 and below. The reason for this is that the modules are actually example code, and it's not worth the overhead to maintain backward compatibility for them.

## Installation

```bash
npm install react-beyond
```

## Create a new feature

```tsx
const BeyondComponent = beyond(Component, config)
```

## Example

## API

 `beyond(cmp, config): ReactComponent`

It applies a React Beyond configuration to the component `cmp` and returns the new component. The configuration will be applied to all descendants of `cmp` as well.

- `cmp`: The root component that you want to apply the configuration to.

- `config`: The configuration object. See below.

### Config object

| Property | Type | Description
|---|---|---|
| id | string | The id of the HOC. Must be a unique string. This will appear appear next to the components in React DevTools.
| mapComponent? | (cmp: FC) => FC | A function that maps a component to a new component. If defined, all the components under the deep HOC will be mapped with this function. This function is called _once per mounted components_. |
| invokeRender? | (render, props, ref) => ReactElement | A function which invokes the base component with the passed `props` and `ref`. If defined, all the components under the deep HOC will be rendered through this function. `render` is always the render function, unwrapped from eventual `forwardRef` and/or `memo` wrappings. This function is called _once per render_. Defaults to `(render, props, ref) => render(props, ref)` |
| mapElement? | (el: ReactElement, magicPropValue?: any) => ReactElement | A function that maps `el` to a new element. If defined, all _elements_ under the deep HOC will be mapped with it. `magicPropValue` will only be passed, when `magicProp` is defined; see below. |
| directiveProp? | string | If defined, `mapElement` will only be called, if a JSX element has a prop with `<magicProp>` prop name. If so, React Beyond removes the magic prop from the props object, and calls `mapElement` with (originalProps, magicPropValue). |


Read the full documentation at [the website](https://react-beyond.github.io/).

