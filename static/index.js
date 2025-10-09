import treeEditor from "./tree-editor.js";
import Node from "./node.js";
import history from "./history.js";

document.body.appendChild(treeEditor.elem);
if (localStorage.getItem("tree")) {
  treeEditor.tree.load(localStorage.getItem("tree"));
} else {
  treeEditor.tree.root = new Node();
  treeEditor.tree.root.focus();
  history.add();
}
