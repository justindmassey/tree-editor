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

let url = new URL(location);
let treeName = url.searchParams.get("tree");
if (treeName != null) {
  let rootName = url.searchParams.get("root");
  if (rootName == null) {
    treeEditor.tree.load(treeName, treeName, false);
  } else {
    treeEditor.tree.load(treeName, rootName, false);
  }
  window.history.replaceState({ tree: treeName }, "", location.href);
} else if (localStorage.getItem("tree") != null) {
  treeName = localStorage.getItem("tree");
  let rootName = localStorage.getItem("root");
  let url = new URL(location);
  url.searchParams.set("tree", treeName);
  if (rootName == null) {
    treeEditor.tree.load(treeName, treeName, false);
    window.history.replaceState({ tree: treeName }, "", url);
  } else {
    url.searchParams.set("root", rootName);
    treeEditor.tree.load(treeName, rootName, false);
    window.history.replaceState({ tree: treeName, root: rootName }, "", url);
  }

  
} else {
  treeEditor.tree.root.focus();
  history.add();
}
