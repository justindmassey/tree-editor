import treeEditor from "./tree-editor.js";
import history from "./history.js";
import globalCommands from "./global-commands.js";

document.body.appendChild(treeEditor.elem);
if (localStorage.getItem("menuBar")) {
  globalCommands["Alt+m"].action.bind(treeEditor)();
}
if (localStorage.getItem("help") || localStorage.getItem("help") == null) {
  globalCommands["Alt+h"].action.bind(treeEditor)();
}
if (localStorage.getItem("output")) {
  globalCommands["Alt+o"].action.bind(treeEditor)();
}
if (localStorage.getItem("showTree") == "") {
  globalCommands["Alt+t"].action.bind(treeEditor)();
}
if (localStorage.getItem("tree")) {
  treeEditor.tree.load(localStorage.getItem("tree"));
} else {
  treeEditor.tree.root.focus();
  history.add();
}

window.treeEditor = treeEditor;
