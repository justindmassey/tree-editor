export default function exportToTree(node, spaces = 4, indent = 0) {
  let text = " ".repeat(indent) + node.nameValue + "\n";
  for (let child of node.children.children) {
    text += exportToTree(child.node, spaces, indent + spaces);
  }
  return text;
}
