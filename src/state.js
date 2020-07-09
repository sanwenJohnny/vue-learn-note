import {observe} from './observe/index.js'
import {proxy} from './util/index'
export function initState(vm) {
    const opts = vm.$options;
    // vue的数据来源 属性 方法 数据 计算属性 watch
    if(opts.props) {
        initProps(vm);
    }
    if(opts.methods) {
        initMethods(vm);
    }
    if(opts.data) {
        initData(vm);
    }
    if(opts.computed) {
        initComputed(vm);
    }
    if(opts.watch){
        initWatch(vm);
    }
}

function initProps(){}
function initMethods(){}
function initData(vm){
    // 数据初始化工作
    let data = vm.$options.data;  // 用户传递的data
    data = vm._data = typeof data === 'function'?data.call(vm):data;
    // 对象劫持 用户改变了数据，希望得到通知 从而更新视图
    // 为了让用户更好的使用，直接vm.xxx取值 采用proxy代理一下
    for(let key in data) {
        proxy(vm, '_data', key)
    }
    observe(data);   // 响应式原理 Object.defineProperty()
}
function initComputed(){}
function initWatch(){}

