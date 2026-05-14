export default function exportToTree(node, indent = 0) {
  let text = " ".repeat(indent) + node.nameValue + "\n";
  for (let child of node.children.children) {
    text += exportToTree(child.node, indent + 4);
  }
  return text;
}
