import { VNode, Fragment } from "@reactv/jsx-runtime";
export const render = (element: VNode, container: HTMLElement) => {
  console.log("render:", element);
  if (element.type === "TEXT_ELEMENT") {
    const dom = document.createTextNode(<string>element.props?.nodeValue);
    container.appendChild(dom);
  } else if (element.type === Fragment) {
    for (const child of (element.props?.children as Array<VNode>) || []) {
      render(child as unknown as VNode, container);
    }
  } else if (element.type instanceof Function) {
    const vdom = element.type(element.props);
    render(vdom, container);
  } else {
    const dom = document.createElement(element.type);
    for (const child of (element.props?.children as Array<VNode>) || []) {
      render(child as unknown as VNode, dom);
    }
    container.appendChild(dom);
  }
};
