import Node from "../node.js";
import parseIndentedText from "../lib/parse-indented-text.js";

function convertNode(node) {
  let n = new Node(node.line);
  for (let child of node.children) {
    n.appendChild(convertNode(child));
  }
  return n;
}

export default function importTree(text, addedRootName = "") {
  if (addedRootName === false) {
    let nodes = [];
    for (let node of parseIndentedText(text, false)) {
      nodes.push(convertNode(node));
    }
    return nodes;
  } else {
    return convertNode(parseIndentedText(text, addedRootName));
  }
}