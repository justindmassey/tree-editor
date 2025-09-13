function exportNode(node) {
  let n = {
    name: node.name.value,
    children: [],
  };
  for (let child of node.children.children) {
    n.children.push(exportNode(child.node));
  }
  return n;
}

export default function exportToJson(node) {
  return JSON.stringify(exportNode(node), null, 2);
}
