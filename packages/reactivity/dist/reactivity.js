// packages/shared/src/index.ts
function isObject(value) {
  return typeof value === "object" && value !== null;
}

// packages/reactivity/src/effect.ts
function effect(cb, option) {
  const _effect = new ReactiveEffect(cb, () => {
    _effect.run();
  });
  _effect.run();
}
var activeEffect = null;
var ReactiveEffect = class {
  // 默认是响应式的
  // fn为用户编写的函数
  // 如果fn中依赖的数据发生了变化，就需要重新调用scheduler 函数
  constructor(fn, scheduler) {
    this.fn = fn;
    this.scheduler = scheduler;
    this._trackId = 0;
    // 用于记录当前effect执行了几次
    this.deps = [];
    this._depLength = 0;
    // 索引
    this.active = true;
  }
  run() {
    if (!this.active) {
      return this.fn();
    }
    const lastEffect = activeEffect;
    try {
      activeEffect = this;
      return this.fn();
    } finally {
      activeEffect = lastEffect;
    }
  }
};
var trakEffect = (activeEffect2, dep) => {
  dep.set(activeEffect2, activeEffect2._trackId);
  activeEffect2.deps[activeEffect2._depLength++] = dep;
};
var triggerEffects = (dep) => {
  const effects = dep;
  for (const effect2 of effects.keys()) {
    if (effect2.scheduler) {
      effect2.scheduler();
      dep.set(effect2, effect2._trackId++);
    }
  }
};

// packages/reactivity/src/reactiveEffect.ts
var targetMap = /* @__PURE__ */ new WeakMap();
var createDeps = (clear, key) => {
  const dep = /* @__PURE__ */ new Map();
  dep.clear = clear;
  dep.name = key;
  return dep;
};
var track = (target, key) => {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = createDeps(() => depsMap.delete(key), key));
    }
    trakEffect(activeEffect, dep);
  }
};
var trigger = (target, key, newValue, oldValue) => {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const dep = depsMap.get(key);
  if (dep) {
    triggerEffects(dep);
  }
};

// packages/reactivity/src/baseHandler.ts
var multableHandlers = {
  get(target, key, receiver) {
    if (key === "__v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
    track(target, key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    const oldValue = target[key];
    let result = Reflect.set(target, key, value, receiver);
    if (oldValue !== value) {
      trigger(target, key, value, oldValue);
    }
    return result;
  }
};

// packages/reactivity/src/reactive.ts
var reactiveMap = /* @__PURE__ */ new WeakMap();
function reactive(target) {
  return createReactiveObject(target);
}
function createReactiveObject(target) {
  if (!isObject(target)) {
    return target;
  }
  if (target["__v_isReactive" /* IS_REACTIVE */]) {
    return target;
  }
  const exitsProxy = reactiveMap.get(target);
  if (exitsProxy) {
    return exitsProxy;
  }
  let proxy = new Proxy(target, multableHandlers);
  reactiveMap.set(target, proxy);
  return proxy;
}
export {
  activeEffect,
  effect,
  reactive,
  trakEffect,
  triggerEffects
};
//# sourceMappingURL=reactivity.js.map
