import { registerHooks } from 'node:module'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'

// Use the project's compiler and aliases without adding a separate test bundler.
const sourceRoot = new URL('../src/', import.meta.url)
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier.startsWith('@/') ||
      (specifier.startsWith('.') && !context.parentURL?.includes('/node_modules/'))
    ) {
      const url = specifier.startsWith('@/')
        ? new URL(specifier.slice(2), sourceRoot)
        : new URL(specifier, context.parentURL)
      const path = fileURLToPath(url)
      for (const candidate of [path, `${path}.ts`, `${path}.tsx`, `${path}/index.ts`]) {
        if (existsSync(candidate) && statSync(candidate).isFile())
          return nextResolve(pathToFileURL(candidate).href, context)
      }
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (url.startsWith(sourceRoot.href) && url.endsWith('.css')) {
      return { format: 'module', shortCircuit: true, source: 'export default {}' }
    }
    if (url.startsWith(sourceRoot.href) && /\.tsx?$/.test(url)) {
      const source = readFileSync(fileURLToPath(url), 'utf8').replaceAll(
        'import.meta.env',
        '({ ...process.env, DEV: false })'
      )
      return {
        format: 'module',
        shortCircuit: true,
        source: ts.transpileModule(source, {
          compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.ESNext,
            jsx: ts.JsxEmit.ReactJSX,
          },
        }).outputText,
      }
    }
    return nextLoad(url, context)
  },
})
