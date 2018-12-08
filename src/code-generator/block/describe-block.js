import Block from "./block"
export default class DescribeBlock extends Block {
    constructor({indent, async} = {}){
        super({indent})
        async = async === undefined ? true : async
        if(async){
            this._lines.unshift(this.indent({value: `describe("", async function(){`}))
        } else {
            this._lines.unshift(this.indent({value: `describe("", function(){`}))
        }
        this._lines.push(this.indent({value: `})`}))
        this.setIndent(this._indent + 1)
    }
    addLine (line) {
        this._lines.splice(this._lines.length - 1, 0, this.indent(line))
    }
    addBlock(block){
        this._lines.splice(this._lines.length - 1, 0, block)
    }
}
