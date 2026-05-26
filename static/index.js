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
if (localStorage.getItem("centerOutput")) {
  treeEditor.tree.output.classList.add("centered");
}

let treeName = new URL(location).searchParams.get("tree");
if (treeName) {
  treeEditor.tree.load(treeName, treeName, false);
  window.history.replaceState({ tree: treeName }, "", location.href);
} else if (localStorage.getItem("tree") != null) {
  treeName = localStorage.getItem("tree");
  treeEditor.tree.load(treeName, treeName, false);
  let url = new URL(location);
  url.searchParams.set("tree", treeName);
  window.history.replaceState({ tree: treeName }, "", url);
} else {
  treeEditor.tree.root.focus();
  history.add();
}
