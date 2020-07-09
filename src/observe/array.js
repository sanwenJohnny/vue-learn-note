// 重写数组的方法有7个 push shift unshift pop reverse sort splice 会导致数组本身发生变化
// slice()

let oldArrayMethods = Array.prototype  // 拿到数组原来的方法
// value.__proto__ = arrayMethods 原型链查找问题，会向上查找，先查找我重写的，重写的没有再继续向上查找
// arrayMethods.__proto__ = oldArrayMethods
export const arrayMethods = Object.create(oldArrayMethods) // 原型查找

const methods = [
    'push',
    'shift',
    'unshift',
    'pop',
    'reverse',
    'sort',
    'splice'
]
methods.forEach(method=>{
    arrayMethods[method] = function(...args) {
        const result = oldArrayMethods[method].apply(this,args) // AOP切片编程 调用原生的数组方法，this谁调用的就是谁，此处是我们的方法
        // push unshift 添加的元素可能还是一个对象 需要继续监听
        let inserted;
        let ob = this.__ob__;
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice': // 3个 新增的属性，splice 有删除，新增的功能，arr.splice(0,1,{name:1})
                inserted = args.slice(2)  // 取增删的数据最后一个
            default:
                break;
        }
        if(inserted) ob.observerArray(inserted); // 将新增属性继续观测
        
        return result
    }
})
