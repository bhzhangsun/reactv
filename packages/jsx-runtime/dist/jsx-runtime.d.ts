declare namespace JSX {
    type Element = string;
    interface IntrinsicElements {
        [eleName: string]: any;
    }
}
type VNodeType = Function | string | "TEXT_ELEMENT";
type VNodeProps = {
    children?: VNode[];
    nodeValue?: unknown;
    [key: string]: unknown;
};
type FragmentProps = {
    children: VNode[];
};
type VNodeRef = {
    current: Element;
};
type VNode = {
    type: VNodeType;
    props: VNodeProps;
    key?: string;
    ref?: VNodeRef;
};
declare function jsx(type: VNodeType, props: VNodeProps, key: string): VNode;
declare function jsxs(type: VNodeType, props: VNodeProps, key: string): VNode;
declare function jsxDEV(type: VNodeType, props: VNodeProps, key: string): VNode;
declare function Fragment(props: {
    children: unknown;
}): unknown;
interface entityMapData {
    [key: string]: string;
}
declare const entityMap: entityMapData;
declare const escapeHtml: (str: object[] | string) => string;
declare const AttributeMapper: (val: string) => string;

export { AttributeMapper, Fragment, FragmentProps, JSX, VNode, VNodeProps, VNodeRef, VNodeType, entityMap, escapeHtml, jsx, jsxDEV, jsxs };
