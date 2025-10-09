import { get } from "./lib/ajax.js";
import tree from "./tree.js";
import Node from "./node.js";
import history from "./history.js";

export default function loadTree(name) {
  get("/trees/" + encodeURIComponent(name)).then((data) => {
    tree.root = Node.deserialize(data);
    history.add();
    localStorage.setItem("tree", name);
  });
}
