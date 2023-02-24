import { VNodeType, VNodeProps, VNode } from '@reactv/jsx-runtime';

/**
 * 调度器由render与状态更新后的更新函数触发工作循环
 * 在workLoop中判断执行时间是否到期，是否有未完成的工作，有便继续循环
 * 每执行一个fiber，生成下一个工作单元fiber，以深度优先遍历的方式进行查找
 */

declare let workInProgressRoot: FiberNode | null;
declare let currentRoot: FiberNode | null;
declare let nextUnitOfWork: FiberNode | null;
declare let deletions: FiberNode[];
declare const schedulerInstances: {
    currentRoot: FiberNode | null;
    workInProgressRoot: FiberNode | null;
    nextUnitOfWork: FiberNode | null;
};
type Action<T> = (v: T) => T;
type Hook<T> = {
    state: T;
    queue: Action<T>[];
};
type FiberNode = {
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
declare function updateHostComponent(fiber: FiberNode): void;
declare function updateFunctionComponent(fiber: FiberNode): void;
declare function workLoop(deadline?: number): void;
declare function performanUnitOfWork(fiber: FiberNode): FiberNode;
declare const render: (element: any, container: HTMLElement) => void;
declare function reconcileChildren(wipFiber: FiberNode, elements: VNode[]): void;
declare function useState<T>(initial: T): [T, (action: Action<T> | T) => void];

export { Action, FiberNode, Hook, currentRoot, deletions, nextUnitOfWork, performanUnitOfWork, reconcileChildren, render, schedulerInstances, updateFunctionComponent, updateHostComponent, useState, workInProgressRoot, workLoop };
