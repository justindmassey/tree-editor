import { div, ol, li } from "./lib/elements.js";
import renderers from "./renderers.js";

export default function nodeToElement(node) {
  let m = node.name.value.match(/^(:\S+)\s*(.*)/);
  if (m && renderers[m[1]]) {
    return renderers[m[1]].render(node, m[2]);
  } else {
    let children = ol();
    for (let child of node.children.children) {
      children.appendChild(li(nodeToElement(child.node)));
    }
    return div(div(node.name.value), children);
  }
}
