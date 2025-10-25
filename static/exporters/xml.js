import Node from "../node.js";

function exportNode(node) {
  try {
    let n;
    if (node.children.children.length) {
      n = document.createElement(node.name.value);
      for (let child of node.children.children) {
        let m = child.node.isAttribute
        if (m) {
          n.setAttribute(m[1], m[2]);
        } else {
          n.appendChild(exportNode(child.node));
        }
      }
    } else {
      n = new Text(node.name.value + "\n");
    }
    return n;
  } catch (e) {}
}

export default function exportToXml(node) {
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' + exportNode(node).outerHTML
  );
}
