import messageActions from './message-actions'
import Block from './block/block'
import DescribeBlock from './block/describe-block'
import ItBlock from './block/it-block'
import GetStringBlock from './block/get-string-block'
import GetIntBlock from './block/get-int-block'
import BaseHandler from './base-handler'
import MethodBlock from './block/method-block'
import {global} from './global-settings'
//import {details as eventToString} from 'key-event-to-string'

export const options = [
    { type: "checkbox", name: "ignoreUncaughtExceptions", title: "Ignore uncaught exceptions", value: false, id: "ignoreUncaughtExceptions"},
    { type: "textbox", name: "typingDelay", title: "The delay between keystrokes", value: 100, id: "typingDelay"}
]

class KeyDownHandler extends BaseHandler {
    handle(block, events, current){
        let { key, keyCode, target, comment, force, timeout, typingDelay } = events[current]
        if(comment){
            block.add(`// ${comment}`)
        }

        let options = {}
        if(force){
            options.force = true
        }
        if(timeout){
            options.timeout = timeout
        }
        if(typingDelay === undefined){
            options.delay = this.options.typingDelay
        } else {
            options.delay = typingDelay
        }
        let sOptions = JSON.stringify(options)
        const selector = target.selector;
        if (keyCode == 16 || keyCode == 17 || keyCode == 18) {
        } else if (keyCode == 13) {
            block.add(`cy.get('${selector}').type('{enter}', ${sOptions})`)
        } else {
            block.add(`cy.get('${selector}').type('${key}', ${sOptions})`)
        }
    }
}

class WaitForSelectorHandler extends BaseHandler {
    handle(block, events, current){
        let { target, comment, timeout } = events[current]
        if(comment){
            block.add(`// ${comment}`)
        }
        let options = {}
        if(timeout){
            options.timeout = timeout
        }
        let sOptions = JSON.stringify(options)
        const selector = target.selector;
        block.add(`cy.get('${selector}', ${sOptions}).should('be.visible')`)
    }
}

class WaitForTextHandler extends BaseHandler {
    handle(block, events, current){
        let { target, comment, timeout } = events[current]
        if(comment){
            block.add(`// ${comment}`)
        }
        const tagName = target.tagName;
        let innerText = target.innerText;
        const isExpression = this.isExpression(innerText)
        innerText = this.format(innerText)
        let options = {}
        if(timeout){
            options.timeout = timeout
        }
        let sOptions = JSON.stringify(options)
        if(isExpression){
            block.add(`cy.get("${tagName}:contains(\" + ${innerText} + \")", ${sOptions}).should('be.visible')`)
        } else {
            block.add(`cy.get("${tagName}:contains(${innerText})", ${sOptions}).should('be.visible')`)
        }
    }
}

class ClickTextHandler extends BaseHandler {
    handle(block, events, current){
        let { target, comment, force, timeout } = events[current]
        if(comment){
            block.add(`// ${comment}`)
        }
        const tagName = target.tagName;
        let innerText = target.innerText;
        const isExpression = this.isExpression(innerText)
        innerText = this.format(innerText)

        let options = {}
        if(force){
            options.force = true
        }
        if(timeout){
            options.timeout = timeout
        }
        let sOptions = JSON.stringify(options)
        if(isExpression){
            block.add(`cy.get("${tagName}:contains(\" + ${innerText} + \")").click(${sOptions})`)
        } else {
            block.add(`cy.get("${tagName}:contains(${innerText})").click(${sOptions})`)
        }
    }
}

class TypeTextHandler extends BaseHandler {
    handle(block, events, current){
        let { value, target, clear, comment, force, timeout, typingDelay } = events[current]
        if(comment){
            block.add(`// ${comment}`)
        }
        const selector = target.selector;
        value = this.format(value);

        if(clear){
            let options = {}
            if(force){
                options.force = true
            }
            if(timeout){
                options.timeout = timeout
            }
            let sOptions = JSON.stringify(options)
            block.add(`cy.get('${selector}').clear(${sOptions})`)
        }
        let options = {}
        if(force){
            options.force = true
        }
        if(timeout){
            options.timeout = timeout
        }
        if(typingDelay === undefined){
            options.delay = this.options.typingDelay
        } else {
            options.delay = typingDelay
        }
        let sOptions = JSON.stringify(options)
        block.add(`cy.get('${selector}').type(${value}, ${sOptions})`)
    }
}

class MouseDownHandler extends BaseHandler {
    handle(block, events, current){
        let { target, comment, force, timeout } = events[current]
        if(comment){
            block.add(`// ${comment}`)
        }
        const selector = target.selector;
        let options = {}
        if(force){
            options.force = true
        }
        if(timeout){
            options.timeout = timeout
        }
        let sOptions = JSON.stringify(options)
        block.add(`cy.get("${selector}").click(${sOptions})`)
    }
}

class ChangeHandler extends BaseHandler {
    handle(block, events, current){
        let { value, target, comment, timeout } = events[current]
        if(comment){
            block.add(`// ${comment}`)
        }
        let options = {}
        if(timeout){
            options.timeout = timeout
        }
        let sOptions = JSON.stringify(options)
        const selector = target.selector;
        if(target.tagName === "SELECT"){
            block.add(`cy.get('${selector}').select('${value}', ${sOptions})`)
        }
    }
}

class WaitHandler extends BaseHandler {
    handle(block, events, current){
        let { value, comment } = events[current]
        if(comment){
            block.add(`// ${comment}`)
        }
        block.add(`cy.wait(${value})`)
    }
}

class GotoHandler extends BaseHandler {
    handle(block, events, current){
        let { value, setLocalStorage, comment, timeout } = events[current]
        if(comment){
            block.add(`// ${comment}`)
        }
        let options = {}
        if(timeout){
            options.timeout = timeout
        }
        let sOptions = JSON.stringify(options)
        value = this.format(value)
        block.add(`cy.visit(${value}, ${sOptions})`)
        if(setLocalStorage){
            block.add(`setLocalStorage()`)
        }
    }
}

class VariableHandler extends BaseHandler {
    handle(block, events, current){
        let { name, value, comment, timeout } = events[current]
        if(comment){
            block.add(`// ${comment}`)
        }
        value = this.format(value)
        block.add(`let ${name} = ${value}`)
    }
}

export class CodeGeneratorCypress {
  constructor (options) {
    this.options = Object.assign(global, options)
    this.language = "js"

    this.handlers = []
    this.handlers['keydown'] = new KeyDownHandler(this.options);
    this.handlers['wait-for-selector*'] = new WaitForSelectorHandler(this.options);
    this.handlers['wait-for-text*'] = new WaitForTextHandler(this.options);
    this.handlers['click-text*'] = new ClickTextHandler(this.options);
    this.handlers['type-text*'] = new TypeTextHandler(this.options);
    this.handlers['mousedown'] = new MouseDownHandler(this.options);
    this.handlers['change'] = new ChangeHandler(this.options);
    this.handlers['wait*'] = new WaitHandler(this.options);
    this.handlers['goto*'] = new GotoHandler(this.options);
    this.handlers['variable*'] = new VariableHandler(this.options);
  }

  generate (events) {
    let block = new Block({indent: 0})

    this.addImports(block)
    //block.add('')
    this.addGlobalVariables(block)
    //block.add('')
    this.addGlobalMethods(block)
    block.add('')
    let describe = new DescribeBlock({async: false})
    let it = new ItBlock({async: false})
    describe.add(``)
    describe.add(it)
    this.addSetup(it)
    this.addEvents(it, events)
    block.add(describe)
    this.addUncaughtException(block)

    return block.build()
  }

  addUncaughtException(block){
    if(this.options.ignoreUncaughtExceptions){
        block.add(`Cypress.on('uncaught:exception', (err, runnable) => {`)
        block.add(`  return false`)
        block.add(`})`)
    }
  }

  addImports(block){
    //block.add(`import xxx from 'xxx';`)
  }

  addGlobalVariables(block){
    //Example
    //block.add(`let xxx = {};`)
  }

  addGlobalMethods(block){

    let getIntBlock = new GetIntBlock();
    block.add(getIntBlock)
    let getStringBlock = new GetStringBlock();
    block.add(getStringBlock)
    const storage = JSON.parse(this.options.localStorage)
    if(Object.keys(storage).length > 0){
        block.add(``)
        let method = new MethodBlock({name: "setLocalStorage", async: false})
        for (let key in storage) {
            let keyValue = storage[key]
            if(typeof(keyValue) === "object"){
                keyValue = JSON.stringify(keyValue);
                method.add(`localStorage.setItem("${key}", JSON.stringify(${keyValue}))`)
            } else {
                method.add(`localStorage.setItem("${key}", "${keyValue}")`)
            }
        }
        block.add(method)
    }
  }

  addSetup(block){
    let cookies = JSON.parse(this.options.cookies)
    for (var key in cookies) {
      let keyValue = JSON.stringify(cookies[key])
      let cookieOptions = JSON.parse(keyValue)
      let name = cookies[key].name;
      let value = cookies[key].value;
      delete cookieOptions.name;
      delete cookieOptions.value;
      cookieOptions = JSON.stringify(cookieOptions);
      block.add(`cy.setCookie("${name}", "${value}", ${cookieOptions})`)
    }
  }

  addEvents (block, events) {
      for (let i = 0; i < events.length; i++) {
          let {action} = events[i]
          const handler = this.handlers[action];
          if(handler){
              handler.handle(block, events, i);
          }
      }
  }
}
