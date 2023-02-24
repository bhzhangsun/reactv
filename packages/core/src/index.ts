/**
 * 调度器由render与状态更新后的更新函数触发工作循环
 * 在workLoop中判断执行时间是否到期，是否有未完成的工作，有便继续循环
 * 每执行一个fiber，生成下一个工作单元fiber，以深度优先遍历的方式进行查找
 */
import { VNode, VNodeProps, VNodeType } from "@reactv/jsx-runtime";

export let workInProgressRoot: FiberNode | null = null;
export let currentRoot: FiberNode | null = null;
export let nextUnitOfWork: FiberNode | null = null;
export let deletions: FiberNode[] = [];
let wipFiber: FiberNode | null = null;
let hookIndex: number = 0;
export const schedulerInstances: {
  currentRoot: FiberNode | null;
  workInProgressRoot: FiberNode | null;
  nextUnitOfWork: FiberNode | null;
} = {
  currentRoot,
  workInProgressRoot,
  nextUnitOfWork,
};

export type Action<T> = (v: T) => T;
export type Hook<T> = {
  state: T;
  queue: Action<T>[];
};

export type FiberNode = {
  type: VNodeType;
  props: VNodeProps;
  dom?: Node;
  parent?: FiberNode;
  child?: FiberNode;
  sibling?: FiberNode;
  alternate?: FiberNode;
  hooks?: Hook<unknown>[];
  effectTag?: "UPDATE" | "PLACEMENT" | "DELETION";
};

export function updateHostComponent(fiber: FiberNode) {
  if (!fiber.dom) {
    fiber.dom =
      fiber.type === "TEXT_ELEMENT"
        ? document.createTextNode(<string>fiber.props?.nodeValue)
        : document.createElement(<string>fiber.type);
    updateDom(fiber.dom, {}, fiber.props);
  }

  reconcileChildren(fiber, fiber.props?.children || []);
}
export function updateFunctionComponent(fiber: FiberNode) {
  fiber.hooks = [];
  wipFiber = fiber;
  hookIndex = 0;

  let children = (fiber.type as Function)(fiber.props);
  children = children instanceof Array ? children : [children];
  reconcileChildren(fiber, children);
}

export function workLoop(deadline: number = 1) {
  while (nextUnitOfWork && deadline) {
    nextUnitOfWork = performanUnitOfWork(nextUnitOfWork);
  }

  if (!nextUnitOfWork && workInProgressRoot) {
    commitRoot();
  }
}

export function performanUnitOfWork(fiber: FiberNode): FiberNode {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    // 创建原生dom
    updateHostComponent(fiber);
  }

  // 若有子节点,返回子节点
  if (fiber.child) return fiber.child;
  let nextFiber: FiberNode = fiber;
  while (nextFiber) {
    // 是否有兄弟节点
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent!;
  }

  return nextFiber;
}

function commitRoot() {
  if (workInProgressRoot?.type === "PROGRESS_ROOT") {
    commitWork(workInProgressRoot.child);
  } else {
    commitWork(workInProgressRoot);
  }

  deletions.forEach(commitWork);
  deletions.splice(0, deletions.length);

  currentRoot = workInProgressRoot;
  workInProgressRoot = null;
}

function commitWork(fiber?: FiberNode | null) {
  if (!fiber) return;
  let parentFiber = fiber.parent!;
  while (!parentFiber.dom) parentFiber = parentFiber.parent!;
  const container = parentFiber.dom;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
    container.appendChild(fiber.dom);
  } else if (fiber.effectTag === "DELETION" && fiber.dom) {
    commitDeletion(fiber, container);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom) {
    updateDom(fiber.dom, fiber.alternate?.props, fiber.props);
  }

  // !TODO 确保每个fiber均有dom， 在createDom中保证
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
function commitDeletion(fiber: FiberNode, container: any) {
  if (fiber.dom) {
    container.removeChild(fiber.dom);
  } else if (fiber.child) {
    commitDeletion(fiber.child, container);
  }
}
function updateDom(
  current: any,
  prevProps: VNodeProps = {},
  nextProps: VNodeProps = {}
) {
  const isEvent = (key: string) => key.startsWith("on");
  const isProperty = (key: string) => key !== "children" && !isEvent(key);
  const isDelete = (key: string) => !(key in nextProps);

  // 删除没有的属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isDelete)
    .forEach((key) => (current[key] = ""));

  // 移除事件
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(isDelete)
    .forEach((key) => {
      const eventType = key.toLowerCase().substring(2);
      current.removeEventListener(eventType, prevProps[key]);
    });

  // 新增&更新key
  Object.keys(nextProps)
    .filter(isProperty)
    .forEach((key) => (current[key] = nextProps[key]));

  // 新增&更新事件
  Object.keys(nextProps)
    .filter(isEvent)
    .forEach((key) => {
      const eventType = key.toLowerCase().substring(2);
      if (prevProps[key] && prevProps[key] !== prevProps[key]) {
        current.removeEventListener(eventType, prevProps[key]);
      }
      current.addEventListener(eventType, nextProps[key]);
    });
}

export const render = (element: any, container: HTMLElement) => {
  workInProgressRoot = {
    type: "PROGRESS_ROOT",
    dom: container,
    props: {
      children: [element],
    },
  };
  nextUnitOfWork = workInProgressRoot;
};

export function reconcileChildren(wipFiber: FiberNode, elements: VNode[]) {
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let newFiber: FiberNode | null = null;
  let prevSibling: FiberNode | null = null;

  for (let i = 0; i < elements.length || oldFiber; i++) {
    const element = elements[i];
    const sameType = element && oldFiber && element.type === oldFiber.type;

    if (sameType) {
      // diff
      newFiber = {
        type: oldFiber!.type,
        props: element.props,
        dom: oldFiber!.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }

    if (element && !sameType) {
      // add
      newFiber = {
        type: element!.type,
        props: element.props,
        // dom: null,
        parent: wipFiber,
        // alternate: null,
        effectTag: "PLACEMENT",
      };
    }

    if (oldFiber && !sameType) {
      // delete, 在替换时与add同时存在
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (i === 0) {
      wipFiber.child = newFiber!;
    } else if (element) {
      prevSibling!.sibling = newFiber!;
    }
    prevSibling = newFiber;
  }
}

export function useState<T>(initial: T): [T, (action: Action<T> | T) => void] {
  const oldHook =
    wipFiber?.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: <Array<Action<T>>>[],
  } as Hook<T>;

  const actions = oldHook?.queue || [];
  actions.forEach((action) => (hook.state = action(hook.state) as T));

  const setState = (action: Action<T> | T) => {
    if (!(action instanceof Function)) {
      action = ((v: T) => action) as Action<T>;
    }
    (<Action<T>[]>hook.queue).push(action as Action<T>);
    workInProgressRoot = {
      type: "PROGRESS_ROOT",
      dom: currentRoot!.dom,
      props: currentRoot!.props,
      alternate: currentRoot!,
    };
    nextUnitOfWork = workInProgressRoot;
    deletions = [];
  };
  (wipFiber!.hooks as Hook<T>[])!.push(hook);
  hookIndex++;
  return [hook.state, setState];
}

function bootstrap() {
  // console.log("loop:", workInProgressRoot);
  if (workInProgressRoot) {
    workLoop();
  }
  requestIdleCallback(bootstrap);
}

bootstrap();
