export default function ctrlClick(node, event) {
  if (event.ctrlKey) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault();
    node.focus();
  }
}
