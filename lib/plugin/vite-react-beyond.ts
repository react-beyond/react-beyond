const indexHtmlPreamble = function () {
  window.__BEYOND_GLOBAL__ = {}

  let currentRefreshRuntime
  let overriden = false

  Object.defineProperty(window, '__REFRESH_RUNTIME__', {
    set: function (RefreshRuntime) {
      if (!overriden) {
        overriden = true

        const beyondGlobal = window.__BEYOND_GLOBAL__
        Object.assign(beyondGlobal, {
          originalRegister: RefreshRuntime.register,
          idToHocs: new Map(),
          cmpToIds: new Map()
        })

        RefreshRuntime.register = function (cmp, id) {
          // cmpToIds is only relevant for the first time a HOC chain is
          // applied. beyond() remembers the original base component, so it'll
          // alwasy be able to retrieve the id.
          if (!beyondGlobal.cmpToIds.get(cmp)) {
            beyondGlobal.cmpToIds.set(cmp, [])
          }

          const ids = beyondGlobal.cmpToIds.get(cmp)
          ids.push(id)

          if (!beyondGlobal.idToHocs.get(id)) {
            beyondGlobal.idToHocs.set(id, [])
          }

          const hocs = beyondGlobal.idToHocs.get(id)


          beyondGlobal.isReapplication = true
          let applied = cmp
          for (const hoc of hocs) {
            applied = beyondGlobal.beyond(applied, hoc.opts)
          }
          beyondGlobal.isReapplication = false

          beyondGlobal.originalRegister(cmp, id)
        }
      }

      currentRefreshRuntime = RefreshRuntime
    },
    get: function () {
      return currentRefreshRuntime
    }
  })
}
  .toString()
  .replace(/^function\s*\(\)\s*\{/, '')
  .slice(0, -1)

function viteReactBeyond() {
  let hmr = true

  return {
    name: 'react-beyond-hmr',
    configResolved(config) {
      hmr = !(
        config.isProduction ||
        config.command === 'build' ||
        config.server.hmr === false
      )
    },
    transform(code, id) {
      if (!hmr) return code

      return code.replace(
        /(import RefreshRuntime from "\/@react-refresh")/,
        '$1; window.__REFRESH_RUNTIME__ = RefreshRuntime'
      )
    },
    transformIndexHtml(html) {
      if (hmr) {
        return html.replace(
          /<head>/,
          `<head><script>${indexHtmlPreamble}</script>`
        )
      }
    }
  }
}

export default function viteReactBeyondWrapper(react?: any) {
  return [react, viteReactBeyond()]
}
