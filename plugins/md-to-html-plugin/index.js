const { readFileSync } = require('fs')
const { resolve } = require('path')
const { compilerHTML } = require('./compiler')
const INNER_MARK = '<!-- inner -->'

class MdToHtmlPlugin {
  constructor({ template, filename }) {
    if (!template) {
      throw new Error('The config for "templete" must be configured')
    }
    this.template = template
    this.filename = filename ? filename : 'md.html'
  }

  apply(compiler) {
    compiler.hooks.emit.tap('md-to-html-plugin', (compilation) => {
      const _assets = compilation.assets
      const _mdContent = readFileSync(this.template, 'utf8')
      const _templateHTML = readFileSync(resolve(__dirname, 'template.html'), 'utf8')
      const _mdContentArr = _mdContent.split('\r\n')
      const _htmlStr = compilerHTML(_mdContentArr)
      const _finalHTML = _templateHTML.replace(INNER_MARK, _htmlStr)

      _assets[this.filename] = {
        source() {
          return _finalHTML
        },

        size() {
          return _finalHTML.length
        }
      }
    })
  }
}

module.exports = MdToHtmlPlugin