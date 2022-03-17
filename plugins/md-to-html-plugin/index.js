const { readFileSync } = require('fs')
const { resolve } = require('path')
const { compilerHTML } = require('./compiler')
const INNER_MARK = '<!-- inner -->'

class MdToHtmlPlugin {
  constructor({ template, filename }) {
    if (!template) {
      throw new Error('The config for "templete" must be configured')
    }
    this.template = template // 模板文件路径
    this.filename = filename ? filename : 'md.html'  // 输出文件名
  }

  apply(compiler) {
    compiler.hooks.emit.tap('md-to-html-plugin', (compilation) => {
      const _assets = compilation.assets // 获取所有文件
      // console.log(_assets)

      const _mdContent = readFileSync(this.template, 'utf8') // 读取到的模板文件内容
      // console.log(_mdContent)

      const _templateHTML = readFileSync(resolve(__dirname, 'template.html'), 'utf8') //  输出到html
      // console.log(_templateHTML)

      const _mdContentArr = _mdContent.split('\r\n') // 分割成数组
      // console.log(_mdContentArr)

      const _htmlStr = compilerHTML(_mdContentArr) // 编译成html
      // console.log(_htmlStr)

      const _finalHTML = _templateHTML.replace(INNER_MARK, _htmlStr) // 替换模板内容
      // console.log(_finalHTML)

      // 将编译好的html写入到输出文件
      _assets[this.filename] = {
        source() {
          return _finalHTML
        },

        size() {
          return _finalHTML.length
        }
      }
      // console.log(_assets)
    })
  }
}

module.exports = MdToHtmlPlugin