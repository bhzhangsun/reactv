'use strict';

function jsx(type, props, key) {
    const shiftVNode = (children) => {
        if (!(children instanceof Array)) {
            children = [children];
        }
        return children.map((child) => {
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
            children: shiftVNode(props.children),
        },
        key: key,
    };
}
function jsxs(type, props, key) {
    return jsx(type, props, key);
}
function jsxDEV(type, props, key) {
    return jsx(type, props, key);
}
function Fragment(props) {
    return props.children;
}
const entityMap = {
    "&": "amp",
    "<": "lt",
    ">": "gt",
    '"': "quot",
    "'": "#39",
    "/": "#x2F",
};
const escapeHtml = (str) => String(str).replace(/[&<>"'\/\\]/g, (s) => `&${entityMap[s]};`);
// To keep some consistency with React DOM, lets use a mapper
// https://reactjs.org/docs/dom-elements.html
const AttributeMapper = (val) => ({
    tabIndex: "tabindex",
    className: "class",
    readOnly: "readonly",
}[val] || val);

exports.AttributeMapper = AttributeMapper;
exports.Fragment = Fragment;
exports.entityMap = entityMap;
exports.escapeHtml = escapeHtml;
exports.jsx = jsx;
exports.jsxDEV = jsxDEV;
exports.jsxs = jsxs;
