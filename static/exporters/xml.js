function exportNode(node) {
  if (node.children.children.length || !node.parent) {
    let n;
    try {
      console.log(node.nameValue);
      n = document.createElement(node.nameValue);
    } catch (e) {
      alert(`Invalid tagname: "${node.nameValue}"`);
      return;
    }
    for (let child of node.children.children) {
      let m = child.node.isAttribute;
      if (m) {
        try {
          n.setAttribute(m[1], m[2]);
        } catch (e) {
          alert(`Invalid attribute name: "${m[1]}"`);
          return n;
        }
      } else {
        n.appendChild(exportNode(child.node));
      }
    }
    return n;
  } else {
    return new Text(node.nameValue + "\n");
  }
}

export default function exportToXml(node) {
  let xml = exportNode(node);
  if (xml) {
      return '<?xml version="1.0" encoding="UTF-8"?>\n' + xml.outerHTML;
  }
}
