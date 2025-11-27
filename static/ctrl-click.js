export default function ctrlClick(node, event) {
  if (event.ctrlKey) {
    event.stopPropagation();
    event.preventDefault();
    node.focus();
  }
}