let workInProgressRoot = null;
let currentRoot = null;
let nextUnitOfWork = null;
let deletions = [];
let wipFiber = null;
let hookIndex = 0;
const schedulerInstances = {
    currentRoot,
    workInProgressRoot,
    nextUnitOfWork,
};
function updateHostComponent(fiber) {
    if (!fiber.dom) {
        fiber.dom =
            fiber.type === "TEXT_ELEMENT"
                ? document.createTextNode(fiber.props?.nodeValue)
                : document.createElement(fiber.type);
        updateDom(fiber.dom, {}, fiber.props);
    }
    reconcileChildren(fiber, fiber.props?.children || []);
}
function updateFunctionComponent(fiber) {
    fiber.hooks = [];
    wipFiber = fiber;
    hookIndex = 0;
    let children = fiber.type(fiber.props);
    children = children instanceof Array ? children : [children];
    reconcileChildren(fiber, children);
}
function workLoop(deadline = 1) {
    while (nextUnitOfWork && deadline) {
        nextUnitOfWork = performanUnitOfWork(nextUnitOfWork);
    }
    if (!nextUnitOfWork && workInProgressRoot) {
        commitRoot();
    }
}
function performanUnitOfWork(fiber) {
    const isFunctionComponent = fiber.type instanceof Function;
    if (isFunctionComponent) {
        updateFunctionComponent(fiber);
    }
    else {
        // 创建原生dom
        updateHostComponent(fiber);
    }
    // 若有子节点,返回子节点
    if (fiber.child)
        return fiber.child;
    let nextFiber = fiber;
    while (nextFiber) {
        // 是否有兄弟节点
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
    return nextFiber;
}
function commitRoot() {
    if (workInProgressRoot?.type === "PROGRESS_ROOT") {
        commitWork(workInProgressRoot.child);
    }
    else {
        commitWork(workInProgressRoot);
    }
    deletions.forEach(commitWork);
    deletions.splice(0, deletions.length);
    currentRoot = workInProgressRoot;
    workInProgressRoot = null;
}
function commitWork(fiber) {
    if (!fiber)
        return;
    let parentFiber = fiber.parent;
    while (!parentFiber.dom)
        parentFiber = parentFiber.parent;
    const container = parentFiber.dom;
    if (fiber.effectTag === "PLACEMENT" && fiber.dom) {
        container.appendChild(fiber.dom);
    }
    else if (fiber.effectTag === "DELETION" && fiber.dom) {
        commitDeletion(fiber, container);
    }
    else if (fiber.effectTag === "UPDATE" && fiber.dom) {
        updateDom(fiber.dom, fiber.alternate?.props, fiber.props);
    }
    // !TODO 确保每个fiber均有dom， 在createDom中保证
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}
function commitDeletion(fiber, container) {
    if (fiber.dom) {
        container.removeChild(fiber.dom);
    }
    else if (fiber.child) {
        commitDeletion(fiber.child, container);
    }
}
function updateDom(current, prevProps = {}, nextProps = {}) {
    const isEvent = (key) => key.startsWith("on");
    const isProperty = (key) => key !== "children" && !isEvent(key);
    const isDelete = (key) => !(key in nextProps);
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
const render = (element, container) => {
    workInProgressRoot = {
        type: "PROGRESS_ROOT",
        dom: container,
        props: {
            children: [element],
        },
    };
    nextUnitOfWork = workInProgressRoot;
};
function reconcileChildren(wipFiber, elements) {
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    let newFiber = null;
    let prevSibling = null;
    for (let i = 0; i < elements.length || oldFiber; i++) {
        const element = elements[i];
        const sameType = element && oldFiber && element.type === oldFiber.type;
        if (sameType) {
            // diff
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE",
            };
        }
        if (element && !sameType) {
            // add
            newFiber = {
                type: element.type,
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
            wipFiber.child = newFiber;
        }
        else if (element) {
            prevSibling.sibling = newFiber;
        }
        prevSibling = newFiber;
    }
}
function useState(initial) {
    const oldHook = wipFiber?.alternate &&
        wipFiber.alternate.hooks &&
        wipFiber.alternate.hooks[hookIndex];
    const hook = {
        state: oldHook ? oldHook.state : initial,
        queue: [],
    };
    const actions = oldHook?.queue || [];
    actions.forEach((action) => (hook.state = action(hook.state)));
    const setState = (action) => {
        if (!(action instanceof Function)) {
            action = ((v) => action);
        }
        hook.queue.push(action);
        workInProgressRoot = {
            type: "PROGRESS_ROOT",
            dom: currentRoot.dom,
            props: currentRoot.props,
            alternate: currentRoot,
        };
        nextUnitOfWork = workInProgressRoot;
        deletions = [];
    };
    wipFiber.hooks.push(hook);
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

export { currentRoot, deletions, nextUnitOfWork, performanUnitOfWork, reconcileChildren, render, schedulerInstances, updateFunctionComponent, updateHostComponent, useState, workInProgressRoot, workLoop };
