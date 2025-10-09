import Node from "../node.js";
import parseIndentedText from "../lib/parse-indented-text.js";

function convertNode(node) {
  let n = new Node(node.line);
  for (let child of node.children) {
    n.appendChild(convertNode(child));
  }
  return n;
}

export default function importText(text) {
  return convertNode(parseIndentedText(text));
}
