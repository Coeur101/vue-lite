import { isObject } from "@vue_lite/shared";
import { multableHandlers, ReactiveFlags } from "./baseHandler";


// 创建一个WeakMap 来做缓存
const reactiveMap = new WeakMap()

export function reactive(target) {

  return createReactiveObject(target)
}

function createReactiveObject(target: any) {
  if (!isObject(target)) {
    return target
  }
  // 如果target被代理过的肯定有get和set方法
  // 所以这里在读取ReactiveFlags.IS_REACTIVE是否是代理对象
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }
  // 取的话就在weakMap里取，这样就不会多次创建造成内存泄漏
  const exitsProxy = reactiveMap.get(target)
  if (exitsProxy) {
    return exitsProxy
  }

  // 创建代理对象
  let proxy = new Proxy(target, multableHandlers)
  // 创建一次就存一次
  reactiveMap.set(target, proxy)
  return proxy
}
