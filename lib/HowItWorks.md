# How React Beyond works

## Core mechanics

React Deep HOC lets you define higher order components (HOCs) that are automatically applied to the entire subtree of the wrapped component, not just its direct JSX output. It walks through the resulting JSX tree and replaces all component elements with their wrapped versions. During this process, it applies configurable mapping functions to all the elements, as well as an invoker callback to the render function, and a regular, shallow higher order component.

React Beyond is
- performant
- it can be nested and it'll be scoped
- works with HMR / React Fast Refresh
- supports TypeScript (only global)
- doesn't penetrate through class components

## HMR / React Fast Refresh

1. We tap into RefreshRuntime.register().
2. When there's a registration, we save the cmp/id link to a map (cmpToIds). We only need to do it once per component.
3. When beyond() is applied the first time, it looks up the componend id from cmpToIds, and saves the HOC chain info in another map (idToHocs). Once this HOC chain info is connected to the id, cmpToIds is no longer needed.
4. Then beyond() calls the original RefreshRuntime.register() function with the id amended with the HOC chain (e.g. '/src/App.tsx App hoc1 < hoc2 < hoc3')
5. From this point onward, whenever HMR triggers, the HOC chain info is retrieved from idToHocs in the RefreshRuntime.register() tap, and the hocs are reapplied. We set a flag to prevent beyond() re-adding the HOC chain info to the idToHocs record; but beyond() still registers the HOC'd components with the amended id.

