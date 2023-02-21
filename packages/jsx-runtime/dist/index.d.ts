export declare namespace JSX {
    type Element = string;
    interface IntrinsicElements {
        [eleName: string]: any;
    }
}
export type VNodeType = Function | string | "TEXT_ELEMENT";
export type VNodeProps = {
    children?: (VNode | string)[] | string;
    nodeValue?: unknown;
    [key: string]: unknown;
};
export type FragmentProps = {
    children: VNode[];
};
export type VNodeRef = {
    current: Element;
};
export type VNode = {
    type: VNodeType;
    props: VNodeProps;
    key?: string;
    ref?: VNodeRef;
};
export declare const jsx: (type: VNodeType, props: VNodeProps, key: string) => {
    type: VNodeType;
    props: {
        children: VNode[];
        nodeValue?: unknown;
    };
    key: string;
    ref: unknown;
};
export declare const jsxs: (type: VNodeType, props: VNodeProps, key: string) => {
    type: VNodeType;
    props: {
        children: VNode[];
        nodeValue?: unknown;
    };
    key: string;
    ref: unknown;
};
export declare const jsxDEV: (type: VNodeType, props: VNodeProps, key: string) => {
    type: VNodeType;
    props: {
        children: VNode[];
        nodeValue?: unknown;
    };
    key: string;
    ref: unknown;
};
export declare const Fragment = "FRAGMENT_ELEMENT";
interface entityMapData {
    [key: string]: string;
}
export declare const entityMap: entityMapData;
export declare const escapeHtml: (str: object[] | string) => string;
export declare const AttributeMapper: (val: string) => string;
export {};
