export function effect(cb: () => void, option?: any) {
  // 创建一个响应式effect
  // 数据变化后可以重新执行
  const _effect = new ReactiveEffect(cb, () => {
    _effect.run()
  }) // 响应式effect
  _effect.run()
}
export let activeEffect = null
// 响应式effect实现
class ReactiveEffect {
  _trackId = 0 // 用于记录当前effect执行了几次
  deps = []
  _depLength = 0 // 索引
  public active = true // 默认是响应式的
  // fn为用户编写的函数
  // 如果fn中依赖的数据发生了变化，就需要重新调用scheduler 函数
  constructor(public fn, public scheduler) {
  }
  run() {
    if (!this.active) {
      // 不是响应式的话不做任何处理
      return this.fn()
    }
    // 创建一个变量，来记录最后一个指向fn前的effect，使得this不丢失
    // 应对在一个fn函数中使用多次effect情况
    const lastEffect = activeEffect
    try {
      // 在执行函数之前，拿到这个响应式Effect的this
      activeEffect = this
      // 不在effect中调用fn则拿不到effect的this
      return this.fn() // 这里在执行的时候就会出发代理对象的get方法  
    } finally {
      // 将activeEffect设置为undefined 防止内存泄漏
      activeEffect = lastEffect
    }

  }
}
// 双向收集，dep收集effect，effect收集dep effect知道有多少个依赖收集了effect
// dep知道他收集effect有多少个，执行了几次
export const trakEffect = (activeEffect, dep) => {
  dep.set(activeEffect, activeEffect._trackId)
  activeEffect.deps[activeEffect._depLength++] = dep
}

export const triggerEffects = (dep) => {
  const effects = dep
  for (const effect of effects.keys()) {
    if (effect.scheduler) {
      effect.scheduler()
      dep.set(effect, effect._trackId++) // 增加使用次数
    }
  }
}
