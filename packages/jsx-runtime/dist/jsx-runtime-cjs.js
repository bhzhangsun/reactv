"use strict";const e=(e,t,r)=>{let p=[];return p="string"==typeof t.children?[{type:"TEXT_ELEMENT",props:{nodeValue:t.children}}]:t.children instanceof Array?t.children.map((e=>"string"==typeof e?{type:"TEXT_ELEMENT",props:{nodeValue:e}}:e)):t.children,{type:e,props:{...t,children:p},key:r,ref:t.ref}},t={"&":"amp","<":"lt",">":"gt",'"':"quot","'":"#39","/":"#x2F"};exports.AttributeMapper=e=>({tabIndex:"tabindex",className:"class",readOnly:"readonly"}[e]||e),exports.Fragment="FRAGMENT_ELEMENT",exports.entityMap=t,exports.escapeHtml=e=>String(e).replace(/[&<>"'\/\\]/g,(e=>`&${t[e]};`)),exports.jsx=e,exports.jsxDEV=(t,r,p)=>e(t,r,p),exports.jsxs=(t,r,p)=>e(t,r,p);