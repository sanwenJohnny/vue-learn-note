import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';

export default {
    input: './src/index.js', // 以哪个文件作为打包入口
    output: {
        file: 'dist/umd/vue.js',  // 出口路径
        name: 'Vue', // 指定打包全局变量的名字
        format: 'umd', // 统一模块规范
        sourcemap: true, // es6->es5 开启源码调试，可以找到源代码的报错位置
    },
    plugins:[
        babel({
            exclude: 'node_modules/**'
        }),
        process.env.ENV === 'development'?serve({
            open: true,
            openPage: '/public/index.html', //默认打开html的路径
            port: 3000,
            contentBase: '' // 以当前文件开服务
        }):null
    ]

}