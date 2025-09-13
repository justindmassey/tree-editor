import Node from "../node.js";

function importNode(node) {
  let n = new Node(node.name);
  for (let child of node.children) {
    n.appendChild(importNode(child));
  }
  return n;
}

export default function importJson(json) {
  return importNode(JSON.parse(json));
}
