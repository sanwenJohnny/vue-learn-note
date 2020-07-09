import {parseHTML} from './parser-html'
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;   // 解析{{}}

function genProps(attrs) {  // 处理属性，拼接成属性的字符串
    let str = ''; // 作为返回结果
    for(let i=0;i<attrs.length;i++){
        let attr = attrs[i];
        // 标签里有style的时候
        if(attr.name === 'style') {
            // style="color: red;fontSize:14px" => {style:{color:'red'},id:name,}
            let obj = {};
            attr.value.split(';').forEach(item => {
                let [key,value] = item.split(':');
                obj[key] = value
            });
            attr.value = obj;
        }
        str+= `${attr.name}:${JSON.stringify(attr.value)},` // , 拼接分割
    }
    return `{${str.slice(0,-1)}}`  // 删除最后的 , 号
}
function genChildren(el){
    let children = el.children;  // 孩子可能是数组
    if(children && children.length>0) {
        return `${children.map(c=>gen(c)).join(',')}`
    } else {
        return false;
    }
}
function gen(node){ // 孩子节点
    if (node.type == 1) { // 类型1是元素标签
        return generate(node)
    } else {
        let text = node.text;   // 例子： a {{name}} b{{age}} c  => _v("a"+_s(name)+"b"+_s(age)+'c')
        let tokens = [];
        let match,index;
        // 每次的偏移量 buffer.split() 方法也是这样
        let lastIndex = defaultTagRE.lastIndex = 0;
        while(match = defaultTagRE.exec(text)){
            index = match.index;
            if(index > lastIndex){
                tokens.push(JSON.stringify(text.slice(lastIndex,index)));
            }
            tokens.push(`_s(${match[1].trim()})`);
            lastIndex = index + match[0].length;
        }
        if(lastIndex < text.length) {
            tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return `_v(${tokens.join('+')})`;
    }
}

function generate(el){ // [{name:'id',value:'app'},{}]  {id:app,a:1,b:2}
    let children = genChildren(el);
    let code = `_c("${el.tag}",${
        el.attrs.length?genProps(el.attrs):'undefined'
    }${
        children?`,${children}`:''
    })
    `
    return code;
}

export function compileToFunction(template) {
    // 1) 解析html字符串，将html字符串 => ast语法树
    let root = parseHTML(template);

    // 2) 需要将ast语法树生成最终的render函数，本质就是字符串的拼接（别名：模板引擎）
    // 核心思路就是将模板转化成下面这段字符串
    // <div id="app"><p>hello {{name}}</p> hello</div>
    // 将ast树再次转化成js的语法
    // _c("div",{id:app},_c("p",undefined,_v('hello' + _s(name) )),_v('hello'))
    let code = generate(root);
    
    console.log('----', code)

    return function render(){
        
    }
}


