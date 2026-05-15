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
    return parseIndentedText(text, false).map(convertNode);
  } else {
    return convertNode(parseIndentedText(text, addedRootName));
  }
}