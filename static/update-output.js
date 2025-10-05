import tree from "./tree.js"
import {div} from "./lib/elements.js"

function exportNode(node) {
  let n;
  if(node.children.children.length) {
    n = document.createElement(node.name.value);
    for(let child of node.children.children) {
      let m = child.node.name.value.match(/^([^=]+)=(.*)$/);
      if(m) {
	n.setAttribute(m[1], m[2]);
      } else {
	n.appendChild(exportNode(child.node));
      }
    }
  } else {
    n = div(node.name.value);
  }
  return n;
}

export default function updateOutput() {
  //tree.output.replaceChildren(exportNode(tree.root))
}
