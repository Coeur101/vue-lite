// packages/shared/src/index.ts
function isObject(value) {
  return typeof value === "object" && value !== null;
}

// packages/reactivity/src/reactive.ts
var multableHandlers = {
  get(target, key, receiver) {
    if (key === "__v_isReactive" /* IS_REACTIVE */) {
      return true;
    }
  },
  set(target, key, value, receiver) {
    return true;
  }
};
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

// packages/reactivity/src/effect.ts
function effect() {
}
export {
  effect,
  reactive
};
//# sourceMappingURL=reactivity.js.map
