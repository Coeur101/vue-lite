// 这个文件会帮我们打包packages下的模块，最终打包出js文件
import minimist from "minimist";
import * as path from 'path'
import { fileURLToPath } from "url";
import { createRequire } from "module";
import esbuild from 'esbuild'
// 获取当前文件的路径
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// 根据当前路径，创建一个require方法 兼容cjs的模块
const _require = createRequire(import.meta.url)
// node中的命令参数通过process来获取
const args = minimist(process.argv.slice(2));
// 拿到打包的是哪个模块
const target = args._[0] || 'reactivity'
const format = args.f || 'iife'
// 获取当前要打包文件的绝对路径，去打包
// 入口
const entry = path.resolve(__dirname, `../packages/${target}/src/index.ts`)

// 获取名称，用于iife立即执行函数后需要接收的变量，使用package.json中的buildOption的name
const pkg = _require(`../packages/${target}/package.json`)
// 使用esbuild进行打包
esbuild.context({
  entryPoints: [entry],
  outfile: path.resolve(__dirname, `../packages/${target}/dist/${target}.js`), // 出口
  bundle: true, // 把所有的依赖文件打包成一个js
  platform: 'browser', // 打包后给浏览器使用
  sourcemap: true, // 生成sourcemap文件，代表源码可调式
  format: format,
  globalName: pkg.buildOptions?.name,
}).then((ctx) => {
  console.log("start dev");
  return ctx.watch() // 监控入口文件，持续打包
})
