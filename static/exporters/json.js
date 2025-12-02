import Node from "../node.js";

function exportNode(node) {
  let n = {};
  for (let child of node.children.children) {
    if (child.node.isAttribute) {
      n[child.node._isAttribute[1]] = child.node._isAttribute[2];
    } else {
      n[child.node.name.value] = exportNode(child.node);
    }
  }
  return n;
}

export default function exportToJson(node) {
  if (node.isAttribute) {
    return JSON.stringify({ [node._isAttribute[1]]: node._isAttribute[2] });
  } else {
    return JSON.stringify({ [node.name.value]: exportNode(node) }, null, 2);
  }
}
