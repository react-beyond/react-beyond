const indexHtmlPreamble = function () {
  window.__DEEPHOC_GLOBAL__ = {}

  let currentRefreshRuntime
  let overriden = false

  Object.defineProperty(window, '__REFRESH_RUNTIME__', {
    set: function (RefreshRuntime) {
      if (!overriden) {
        overriden = true

        const deepHocGlobal = window.__DEEPHOC_GLOBAL__
        Object.assign(deepHocGlobal, {
          originalRegister: RefreshRuntime.register,
          idToHocs: new Map(),
          cmpToIds: new Map()
        })

        RefreshRuntime.register = function (cmp, id) {
          // cmpToIds is only relevant for the first time a HOC chain is
          // applied. deepHoc() remembers the original base component, so it'll
          // alwasy be able to retrieve the id.
          if (!deepHocGlobal.cmpToIds.get(cmp)) {
            deepHocGlobal.cmpToIds.set(cmp, [])
          }

          const ids = deepHocGlobal.cmpToIds.get(cmp)
          ids.push(id)

          if (!deepHocGlobal.idToHocs.get(id)) {
            deepHocGlobal.idToHocs.set(id, [])
          }

          const hocs = deepHocGlobal.idToHocs.get(id)


          deepHocGlobal.isReapplication = true
          let applied = cmp
          for (const hoc of hocs) {
            applied = deepHocGlobal.deepHoc(applied, hoc.opts)
          }
          deepHocGlobal.isReapplication = false

          deepHocGlobal.originalRegister(cmp, id)
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

function viteReactDeepHoc() {
  let hmr = true

  return {
    name: 'react-deephoc-hmr',
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

export default function viteReactDeepHocWrapper(react?: any) {
  return [react, viteReactDeepHoc()]
}
