import { activeEffect } from "./effect"
import { track, trigger } from "./reactiveEffect"

export enum ReactiveFlags {
  // 是否拥有reactive响应式
  IS_REACTIVE = '__v_isReactive'
}
// proxy需要搭配Reflect来使用
export const multableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    // 是代理对象就返回true
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
    // 取值的时候 让响应属性和 effect建立映射

    // 依赖收集 这里拿到响应的Effect的this
    track(target, key) // 收集这个对象上的属性，并和effect关联
    // 为什么要用reflect反射对象来取值，是因为
    // 需要防止在get方法里取值，导致死循环，并且可以拿到原型链上的值
    // 使用refect可以避免this指向的问题，使对象中的函数获取到的this永远都是proxy代理对象上的this
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    // 赋值的时候触发更新
    // 比较差异
    const oldValue = target[key]
    let result = Reflect.set(target, key, value, receiver)
    if (oldValue !== value) {
      // 触发更新
      trigger(target, key, value, oldValue)
    }
    // 让effect重新执行

    return result
  }
}
