export namespace JSX {
  export type Element = string;
  export interface IntrinsicElements {
    [eleName: string]: any;
  }
}

/* https://github.com/preactjs/preact/blob/master/jsx-runtime/src/index.js
 * Custom jsx parser
 * See: tsconfig.json
 *
 *  {
      "jsx": "react-jsx",
      "jsxImportSource": "@reactv",
      "types": [
        "@reactv/jsx-runtime"
      ]
    }
 *
 */

export type VNodeType = Function | string | "TEXT_ELEMENT";
export type VNodeProps = {
  children?: VNode[];
  nodeValue?: unknown;
  [key: string]: unknown;
};
export type FragmentProps = { children: VNode[] };
export type VNodeRef = { current: Element };

export type VNode = {
  type: VNodeType;
  props: VNodeProps;
  key?: string;
  ref?: VNodeRef;
};

export function jsx(type: VNodeType, props: VNodeProps, key: string): VNode {
  const shiftVNode = (children: unknown) => {
    if (!(children instanceof Array)) {
      children = [children];
    }
    return (children as unknown[]).map((child) => {
      if (typeof child === "object") {
        return child;
      }
      return {
        type: "TEXT_ELEMENT",
        props: { nodeValue: child },
      };
    });
  };

  return {
    type: type,
    props: {
      ...props,
      children: shiftVNode(props.children) as VNode[],
    },
    key: key,
  };
}

export function jsxs(type: VNodeType, props: VNodeProps, key: string): VNode {
  return jsx(type, props, key);
}

export function jsxDEV(type: VNodeType, props: VNodeProps, key: string): VNode {
  return jsx(type, props, key);
}

export function Fragment(props: { children: unknown }) {
  return props.children;
}

interface entityMapData {
  [key: string]: string;
}
export const entityMap: entityMapData = {
  "&": "amp",
  "<": "lt",
  ">": "gt",
  '"': "quot",
  "'": "#39",
  "/": "#x2F",
};

export const escapeHtml = (str: object[] | string) =>
  String(str).replace(/[&<>"'\/\\]/g, (s) => `&${entityMap[s]};`);

// To keep some consistency with React DOM, lets use a mapper
// https://reactjs.org/docs/dom-elements.html
export const AttributeMapper = (val: string) =>
  ({
    tabIndex: "tabindex",
    className: "class",
    readOnly: "readonly",
  }[val] || val);
