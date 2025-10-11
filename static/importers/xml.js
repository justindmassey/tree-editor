import Node from "../node.js";
const TEXT = 3;

function importNode(node) {
  let n = new Node(node.tagName);
  for (let attr of node.attributes) {
    n.setAttribute(attr.name, attr.value);
  }
  for (let child of node.childNodes) {
    if (child.nodeType == TEXT) {
      for (let line of child.textContent.replace(/\n$/, "").split("\n")) {
        n.appendChild(new Node(line));
      }
    } else {
      n.appendChild(importNode(child));
    }
  }
  return n;
}

export default function importXml(xmlStr) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlStr, "text/xml");
  return importNode(doc.documentElement);
}
