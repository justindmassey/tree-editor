export default function exportToText(node, indent = 0) {
  let text = " ".repeat(indent) + node.name.value + "\n";
  for (let child of node.children.children) {
    text += exportToText(child.node, indent + 4);
  }
  return text;
}
