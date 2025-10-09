import Node from "./node.js";
import { div } from "./lib/elements.js";
import history from "./history.js";
import loadTree from "./load-tree.js";

class Tree {
  constructor() {
    this.tree = div();
    this.output = div().c("output", "hidden")
    this.elem = div(
      this.tree,
      this.output
    ).c("tree");
    this.clipboard = null;
    this.load();
  }

  load() {
    if (localStorage.getItem("tree")) {
      loadTree(localStorage.getItem("tree"))
    } else {
      this.root = new Node();
      setTimeout(() => {
	this.root.focus()
	history.add()
      }, 0);
    }

  }

  set root(node) {
    this.tree.replaceChildren(node.elem);
  }

  get root() {
    if (this.tree.firstChild) {
      return this.tree.firstChild.node;
    }
  }

  updateOutput() {
    if(!this.output.classList.contains("hidden")) {
      this.output.replaceChildren(exportNode(this.root));
    }
  }
  
}

function exportNode(node) {
  let n;
  try {
    if(node.children.children.length) {
      n = document.createElement(node.name.value);
      for(let child of node.children.children) {
	let m = child.node.name.value.match(/^([^=]+)=(.*)$/);
	if(m) {
	  n.setAttribute(m[1], m[2]);
	} else {
	  n.appendChild(exportNode(child.node));
	}
      }
    } else {
      n = div(node.name.value);
    }
  } catch(e) {
    n = div();
  }
  return n;
}

export default new Tree();
