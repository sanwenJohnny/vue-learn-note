// ast语法树，使用对象来描述原生语法的  虚拟dom用对象来描述dom节点的

// ast语法树例子
/* <div id="app">
    <p>hello</p>
</div>

let root = {
    tag:'div',
    attrs:[{name:'id',value:'app'}],
    parent:null,
    type:1,  // 1是标签 3是文本
    children:[{
        tag:'p',
        attrs:[],
        parent:root,
        type:1,
        children:[{
            text:'hello',
            type:3
        }]
    }]
} */

// arguments[0] 匹配到的标签， arguments[1] 匹配到的标签名
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*` // abc-aaa
const qnameCapture = `((?:${ncname}\\:)?${ncname})` // ?:匹配不捕获，<aaa:asdf>
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 标签开头的正则，捕获的内容是标签名
const startTagClose = /^\s*(\/?)>/;                // 捕获标签结束的 >
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 捕获标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;   // 匹配属性的
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;   // {{}}

let root = null; // ast语法树根
let currentParent; // 标识当前父亲是谁
let stack = []; // 当前栈
const ELEMENT_TYPE = 1;  // 类型
const TEXT_TYPE = 3;

function createASTElement(tagName, attrs) {
    return {
        tag: tagName,
        type: ELEMENT_TYPE,
        children: [],
        attrs,
        parent: null
    }
}
function start(tagName, attrs) {
    // 遇到开始标签，就创建一个ast元素s
    let element = createASTElement(tagName, attrs);
    if(!root){
        root = element;
    }
    currentParent = element;  // 把当前元素标记成父ast树
    stack.push(element); // 将开始标签存放到栈中
}
function chars(text) {
    text = text.replace(/\s/g,'');
    if(text) {
        currentParent.children.push({
            text,
            type:TEXT_TYPE
        })
    }
}
// <div><p></p></div>  [div,p,]  // 找闭合标签 建立标签的父子关系
function end(tagName) {
    // 如果是结束标签就要开始删除栈中最后一项 里面是ast对象
    let element = stack.pop();  
    // 同时我要标识当前的这个p是属于这个div的儿子
    currentParent = stack[stack.length-1];
    if(currentParent) {
        element.parent = currentParent;
        currentParent.children.push(element);  // 实现一个树的父子关系
    }
}

export function parseHTML(html) {
    // 不停的去解析html
    while(html) {
        let textEnd = html.indexOf('<')
        if(textEnd == 0) {
            // 如果当前索引是0，肯定是一个标签，开始标签
            let startTagMatch = parseStartTag()
            if(startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs);  // 1、解析开始标签
                continue;
            }
            // arguments[0] 匹配到的标签， arguments[1] 匹配到的标签名
            // 结束标签 
            let endTagMatch = html.match(endTag);
            if (endTagMatch) {
                advance(endTagMatch[0].length);
                end(endTagMatch[1]); // 2、解析结束标签
                continue;
            }
        }
        let text;
        // 如果当前索引>=0，肯定是文本信息，获取它
        if(textEnd >= 0) {
            text = html.substring(0, textEnd);
        }
        if(text) {
            advance(text.length);
            chars(text); // 3、解析文本
        }
    }
    function advance(n){
        html = html.substring(n) // 前进删除对应匹配过的内容
    }
    function parseStartTag() {
        let start = html.match(startTagOpen);
        if (start) {
            const match = {
                tagName: start[1],
                attrs: []
            }
            advance(start[0].length);
            let end, attr;
            while( !(end = html.match(startTagClose)) && (attr = html.match(attribute)) ) {
                // 将属性进行解析
                advance(attr[0].length);
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5]
                });
            }
            if (end) {
                advance(end[0].length)
                return match
            }
        }
    }
    return root;
}