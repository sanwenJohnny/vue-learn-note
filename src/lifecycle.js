export function lifecycleMixin(Vue){
    Vue.prototype._update = function(vnode){ // 更新节点

    }
} 

export function mountComponent(vm,el){
    const options = vm.$options; // render
    vm.$el = el; // 真实的dom

    // watcher 用来渲染的 
    // vm._render 通过解析的render方法, 渲染出虚拟dom
    // vm._update 通过虚拟dom, 创建真实的dom

    // 需要去渲染页面
    let updateComponent= () => { // 无论是渲染还是更新调用的都是此方法
        // 返回的都是虚拟dom
        vm._update(vm._render());
    }
    // 渲染watcher,每个组件都有一个watcher
    new Watcher(vm, updateComponent,()=>{},true);  // true表示他是一个渲染watcher

}