import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'

const COMPONENT_PREFIX = 'gs-'
const COMPONENT_REGEXP = /^\.\/(?:[a-z][\w-]*\/)*([A-Z][A-Za-z\d]*)\.vue$/

const requireContext = require.context('./', true, /^\.\/(?:[a-z][\w-]*\/)*([A-Z][A-Za-z\d]*)\.vue$/)

export function registerComponent(app) {
  requireContext.keys().forEach(filename => {
    const name = filename.replace(COMPONENT_REGEXP, '$1')

    const component = requireContext(filename)
    const componentName = upperFirst(camelCase(`${COMPONENT_PREFIX}${name}`))

    app.component(componentName, component.default || component)
  })
}
