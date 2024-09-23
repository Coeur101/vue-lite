import { activeEffect, trakEffect, triggerEffects } from "./effect"
const targetMap = new WeakMap()
export const createDeps = (clear, key) => {
  // 创建map，并且加上自定义属性，用来标识名称和删除对应收集的key
  const dep = new Map() as any
  dep.clear = clear
  dep.name = key
  return dep
}
export const track = (target, key) => {

  // activeEffect 有这个属性说明是在effect中访问的 需要收集
  if (activeEffect) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
      depsMap.set(key, (dep = createDeps(() => depsMap.delete(key), key)))
    }
    trakEffect(activeEffect, dep)
  }
}

export const trigger = (target, key, newValue, oldValue) => {
  const depsMap = targetMap.get(target)
  if (!depsMap) { // 找不到对象直接返回
    return
  }
  const dep = depsMap.get(key)
  if (dep) {
    // 修改的属性对应了effect
    triggerEffects(dep)
  }
}

