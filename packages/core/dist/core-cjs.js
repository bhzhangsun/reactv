'use strict';

exports.workInProgressRoot = null;
exports.currentRoot = null;
exports.nextUnitOfWork = null;
exports.deletions = [];
let wipFiber = null;
let hookIndex = 0;
const schedulerInstances = {
    currentRoot: exports.currentRoot,
    workInProgressRoot: exports.workInProgressRoot,
    nextUnitOfWork: exports.nextUnitOfWork,
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
    while (exports.nextUnitOfWork && deadline) {
        exports.nextUnitOfWork = performanUnitOfWork(exports.nextUnitOfWork);
    }
    if (!exports.nextUnitOfWork && exports.workInProgressRoot) {
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
    if (exports.workInProgressRoot?.type === "PROGRESS_ROOT") {
        commitWork(exports.workInProgressRoot.child);
    }
    else {
        commitWork(exports.workInProgressRoot);
    }
    exports.deletions.forEach(commitWork);
    exports.deletions.splice(0, exports.deletions.length);
    exports.currentRoot = exports.workInProgressRoot;
    exports.workInProgressRoot = null;
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
    exports.workInProgressRoot = {
        type: "PROGRESS_ROOT",
        dom: container,
        props: {
            children: [element],
        },
    };
    exports.nextUnitOfWork = exports.workInProgressRoot;
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
            exports.deletions.push(oldFiber);
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
        exports.workInProgressRoot = {
            type: "PROGRESS_ROOT",
            dom: exports.currentRoot.dom,
            props: exports.currentRoot.props,
            alternate: exports.currentRoot,
        };
        exports.nextUnitOfWork = exports.workInProgressRoot;
        exports.deletions = [];
    };
    wipFiber.hooks.push(hook);
    hookIndex++;
    return [hook.state, setState];
}
function bootstrap() {
    // console.log("loop:", workInProgressRoot);
    if (exports.workInProgressRoot) {
        workLoop();
    }
    requestIdleCallback(bootstrap);
}
bootstrap();

exports.performanUnitOfWork = performanUnitOfWork;
exports.reconcileChildren = reconcileChildren;
exports.render = render;
exports.schedulerInstances = schedulerInstances;
exports.updateFunctionComponent = updateFunctionComponent;
exports.updateHostComponent = updateHostComponent;
exports.useState = useState;
exports.workLoop = workLoop;
