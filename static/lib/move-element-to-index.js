export default function moveElementToIndex(element, newIndex) {
  const parent = element.parentNode;
  if (!parent) return;

  const children = Array.from(parent.children);
  const clampedIndex = Math.max(0, Math.min(newIndex, children.length - 1));

  if (children[clampedIndex] === element) return;
  parent.removeChild(element);
  if (clampedIndex >= parent.children.length) {
    parent.appendChild(element);
  } else {
    parent.insertBefore(element, parent.children[clampedIndex]);
  }
}