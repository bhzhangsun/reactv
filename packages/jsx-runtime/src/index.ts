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
  children?: (VNode | string)[] | string;
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

export const jsx = (type: VNodeType, props: VNodeProps, key: string) => {
  let children: VNode[] = [];
  if (typeof props.children === "string") {
    children = [
      {
        type: "TEXT_ELEMENT",
        props: { nodeValue: props.children },
      },
    ];
  } else if (props.children instanceof Array) {
    children = props.children.map((child) => {
      if (typeof child === "string") {
        return {
          type: "TEXT_ELEMENT",
          props: { nodeValue: child },
        };
      } else {
        return child;
      }
    });
  } else {
    children = props.children;
  }

  return {
    type: type,
    props: {
      ...props,
      children,
    },
    key: key,
    ref: props.ref,
  };
};

export const jsxs = (type: VNodeType, props: VNodeProps, key: string) => {
  return jsx(type, props, key);
};

export const jsxDEV = (type: VNodeType, props: VNodeProps, key: string) => {
  return jsx(type, props, key);
};

export const Fragment = "FRAGMENT_ELEMENT";

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
