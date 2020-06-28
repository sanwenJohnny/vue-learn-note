import {arrayMethods} from './array.js'

// 把data中数据用object.defineProperty重新定义 不兼容IE8
import {isObject} from '../util/index'

class Observer{
    constructor(value) {
        // vue2 如果数据的层次过多，需要递归去解析对象中的属性，依次增加get和set方法
        // vue3 用proxy解决了这个问题
        // 对数组监控
        if(Array.isArray(value)) {
            // 如果是数组的话不对索引进行观测，会导致性能问题
            // 前端开发中很少去操作索引 push shift unshift
            value.__proto__ = arrayMethods
            // 数组里是对象再去监控
            this.observerArray(value)
        }else {
            this.walk(value)
        }
    }
    observerArray(value) {
        for(let i = 0;i < value.length; i++) {
            observe(value[i])
        }
    }
    walk(data) {
        let keys = Object.keys(data)  // [name, age ]
        keys.forEach(key => {
            defineReactive(data, key, data[key]) // 定义响应式数据
        })
    }
}

function defineReactive(data, key, value) {
    observe(value)  // 递归实现深度检测
    Object.defineProperty(data, key, {
        configurable: true,
        enumerable: false,
        get(){  // 获取值得时候做一些操作
            return value;
        },
        set(newValue){  // 也可以操作
            if(newValue === value) return
            observe(newValue)  // 可能用户设置的值也是一个对象
            value = newValue
        }
    })
}

export function observe (data) {
    let isObj = isObject(data)
    if (!isObj) return
    return new Observer(data) // 用来观测对象
}