import Node from "../node.js";

function exportNode(node) {
  if (node.children.children.length) {
    try {
      let n = document.createElement(node.name.value);
    } catch (e) {
      alert("Invalid tagname: " + node.name.value);
      return;
    }
    for (let child of node.children.children) {
      let m = child.node.isAttribute;
      if (m) {
        try {
          n.setAttribute(m[1], m[2]);
        } catch (e) {
          alert("Invalid attribute name: " + m[1]);
          return;
        }
      } else {
        try {
          n.appendChild(exportNode(child.node));
        } catch (e) {}
      }
    }
    return n;
  } else {
    return new Text(node.name.value + "\n");
  }
}

export default function exportToXml(node) {
  let xml = exportNode(node)
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' + (xml && xml.outerHTML || '')
  );
}
