const { randomNum } = require('./util')
/**
 * @todo 增加嵌套列表的处理
 * @todo 增加图片的处理  2022-03-17 15:48:00
 * @todo 增加超链接的处理
 * @todo 增加代码块的处理 简单 @date 2020-03-17 16:38:00 复杂
 * @todo 增加引用的处理 
 * @todo 增加表格的处理 
 * @todo 增加标题的处理 ============== -----------------
 * 
 */

const reg_mark = /^(.+?)\s/ // 匹配 空字符串开头字符结尾

const reg_sharp = /^\#/ // 匹配 #

const reg_crossbar = /^[-\+\*]/ // 匹配 - + *

const reg_number = /^\d/ // 匹配数字

const reg_img = /!\[(.+?)\]\((.+?)\)/g // 匹配图片

const reg_simple_code = /`(.+?)`/g // 匹配简单的代码块



/**
 * mdArr 是一个数组，每一项是一个md文件的每一行内容
 * @returns {object}
 * @param {Array} mdArr 每一项是一个md文件的每一行内容
 * @param {string} reg_img 当前节点的类型
 */


//       # 这是一个h1的标题

//       - 这是UL列表第1项
//       - 这是UL列表第2项
//       - 这是UL列表第3项
//       - 这是UL列表第4项

//       ## 这是一个h2的标题

//       1. 这是OL列表第1项
//       2. 这是OL列表第2项
//       3. 这是OL列表第3项
//       4. 这是OL列表第4项

// match 
//      [ '# ', '#', index: 0, input: '# 这是一个h1的标题', groups: undefined ]
//      null
//      [ '- ', '-', index: 0, input: '- 这是UL列表第1项', groups: undefined ]
//      [ '- ', '-', index: 0, input: '- 这是UL列表第2项', groups: undefined ]
//      [ '- ', '-', index: 0, input: '- 这是UL列表第3项', groups: undefined ]
//      [ '- ', '-', index: 0, input: '- 这是UL列表第4项', groups: undefined ]
//      null
//      [ '## ', '##', index: 0, input: '## 这是一个h2的标题', groups: undefined ]
//      null
//      [ '1. ', '1.', index: 0, input: '1. 这是OL列表第1项', groups: undefined ]
//      [ '2. ', '2.', index: 0, input: '2. 这是OL列表第2项', groups: undefined ]
//      [ '3. ', '3.', index: 0, input: '3. 这是OL列表第3项', groups: undefined ]
//      [ '4. ', '4.', index: 0, input: '4. 这是OL列表第4项', groups: undefined ]
//      null
function createTree(mdArr) {
  let _htmlPool = {} // 树池
  let _lastMark = '' // 上一个mark
  let _key = 0 // 当前节点key


  // 创建树
  mdArr.forEach(mdFragment => { // mdFragment: 每一行的内容
    const matched = mdFragment.match(reg_mark) // 匹配 mark 字符串 (#, -, 1. )

    const matchedImg = mdFragment.match(reg_img) // 匹配图片  

    const matchedSimpleCode = mdFragment.match(reg_simple_code) // 匹配简单的代码块

    // console.log(mdFragment)
    // console.log(matched)

    if (matched) {
      const mark = matched[1] // mark
      // console.log(mark)
      const input = matched['input'] // 匹配到的字符串

      // 如果匹配到的是#开头
      if (reg_sharp.test(mark)) {
        const tag = `h${mark.length}` //  h1-h6
        const tagContent = input.replace(reg_mark, '') // 去掉 mark

        if (_lastMark === mark) {
          // 追加到这种节点的tags中
          _htmlPool[`${tag}-${_key}`].tags = [..._htmlPool[`${tag}-${_key}`].tags, `<${tag}>${tagContent}</${tag}>`]
        } else {
          _lastMark = mark
          _key = randomNum()
          _htmlPool[`${tag}-${_key}`] = {
            type: 'single',
            tags: [`<${tag}>${tagContent}</${tag}>`]
          }
        }
      }

      if (reg_crossbar.test(mark)) {
        const tag = `li` // 标签名 li
        const tagContent = input.replace(reg_mark, '')

        if (_lastMark === mark) {
          // 合并之前的li
          _htmlPool[`ul-${_key}`].tags = [..._htmlPool[`ul-${_key}`].tags, `<${tag}>${tagContent}</${tag}>`]
        } else {
          _lastMark = mark
          _key = randomNum()
          // 创建一个新的ul节点, 并追加到树池中,里面的tags是li标签数组
          _htmlPool[`ul-${_key}`] = {
            type: 'wrap',
            tags: [`<${tag}>${tagContent}</${tag}>`]
          }
        }
      }
      if (reg_number.test(mark)) {
        const tagContent = input.replace(reg_mark, '')
        const tag = `li`

        // why not use _lastMark?
        // 因为无序列表的mark是不同的, 所以需要用正则测试
        if (reg_number.test(_lastMark)) {
          _htmlPool[`ol-${_key}`].tags = [..._htmlPool[`ol-${_key}`].tags, `<${tag}>${tagContent}</${tag}>`]
        } else {
          _lastMark = mark
          _key = randomNum()

          _htmlPool[`ol-${_key}`] = {
            type: 'wrap',
            tags: [`<${tag}>${tagContent}</${tag}>`]
          }
        }
      }
      // if (reg_code.test(mark)) {
      //   console.log(input)
      //   const tagContent = input.replace(reg_mark, '')
      //   const tag = `code`
      //   _htmlPool[`code-${_key}`] = {
      //     type: 'single',
      //     tags: [`<${tag}>${tagContent}</${tag}>`]
      //   }
      // }

    }
    if (matchedImg) {
      imgSrc = matchedImg[0].replace(reg_img, '$2')
      const tag = `img`
      const tagContent = imgSrc

      _htmlPool[`img-${_key}`] = {
        type: 'single',
        tags: [`<p><${tag} src="${tagContent}"></p>`]
      }
    }
    if (matchedSimpleCode) {
      console.log(88888, matchedSimpleCode)
      const tag = `code`
      const tagContent = matchedSimpleCode[0].replace(reg_simple_code, '$1')
      _htmlPool[`code-${_key}`] = {
        type: 'single',
        tags: [`<p><${tag} style="  
        font-family: Menlo,Monaco,Consolas,'Courier New',monospace;
        font-size: .85em !important;
        color: #000;
        background-color: #f0f0f0;
        border-radius: 3px;
        padding: .2em 0;">${tagContent}</${tag}></p>`]
      }
    }
  });

  return _htmlPool
}

function compilerHTML(_mdArr) {
  const _htmlPool = createTree(_mdArr) // 创建树
  console.log(_htmlPool)

  let _htmlStr = '' // 生成的html字符串
  let item // 当前节点

  for (let k in _htmlPool) {
    item = _htmlPool[k] // 当前节点


    // 如果是单节点
    if (item.type === 'single') {
      item.tags.forEach((tag) => {
        _htmlStr += tag
      })
    } else if (item.type === 'wrap') {
      let _list = `<${k.split('-')[0]}>` // ul, ol

      item.tags.forEach((tag) => {
        _list += tag
      })
      _list += `</${k.split('-')[0]}>`
      _htmlStr += _list
    }
  }

  return _htmlStr
}

module.exports = {
  compilerHTML
}