import Node from "./node.js";
import { div, span } from "./lib/elements.js";
import history from "./history.js";
import { get } from "./lib/ajax.js";
import typedefMenu from "./typedef-menu.js";

const minNameSize = 40;
const maxNameSize = 80;

class Tree {
  constructor() {
    this.tree = div().c("tree-container");
    this.output = div().c("output", "hidden");
    this.errorPath = span();
    this.error = div("Recursive type: ", this.errorPath).c("error", "hidden");
    window.addEventListener("keydown", (ev) => {
      if (ev.key == "Control") {
        this.output.classList.add("default-cursor");
      }
    });
    window.addEventListener("keyup", (ev) =>
      this.output.classList.remove("default-cursor"),
    );
    this.elem = div(this.tree, this.output, this.error).c("tree");
    this.root = new Node();
    this.pasteMode = "replace";
  }

  load(name, escapedName = name) {
    get("/tree?name=" + encodeURIComponent(name)).then((data) => {
      if (data.error) {
        this.root = new Node(escapedName);
        this.root.focus();
        history.clear();
        history.add();
        this.tree.scrollTop = 0;
        this.output.scrollTop = 0;
      } else {
        this.root = Node.deserialize(data);
        this.tree.scrollTop = 0;
        this.output.scrollTop = 0;
        history.clear();
        setTimeout(() => history.add(), 0);
        localStorage.setItem("tree", name);
      }
    });
  }

  set root(node) {
    this.tree.replaceChildren(node.elem);
  }

  get root() {
    if (this.tree.firstChild) {
      return this.tree.firstChild.node;
    }
  }

  get name() {
    if ("$name" in this.root.attributes) {
      return this.root._attributes.$name;
    } else {
      return this.root.nameText;
    }
  }

  updateTypes() {
    let typedefs = {};
    let typedefDeps = {};
    typedefMenu.clearItems();
    this.root.traverse((n) => {
      if (!n.isAttribute) {
        let m = n.nameValue.match(Node.typedefRegEx);
        if (m) {
          typedefMenu.addItem(div(m[1]).e("click", () => n.focus()));
          typedefs[m[1]] = n;
          typedefDeps[m[1]] = typedefDeps[m[1]] || new Set();

          n.traverse((n2) => {
            let nodeTypes = n2.nameValue.match(Node.nodeTypeRegEx);
            if (nodeTypes) {
              for (let t of nodeTypes) {
                typedefDeps[m[1]].add(t.slice(1));
              }
            }
            let listTypes = n2.nameValue.match(Node.listTypeRegEx);
            if (listTypes) {
              for (let t of listTypes) {
                typedefDeps[m[1]].add(t.slice(1));
              }
            }
          });
        }
      }
    });

    let tempMark = {};
    let permMark = {};
    let cyclePath = null;

    function hasCycle(name, stack = []) {
      if (permMark[name]) return false;
      if (tempMark[name]) {
        cyclePath = stack.concat(name);
        return true;
      }
      tempMark[name] = true;
      stack.push(name);

      let deps = typedefDeps[name];
      if (deps) {
        for (let dep of deps) {
          if (typedefDeps[dep]) {
            if (hasCycle(dep, stack)) {
              stack.pop();
              return true;
            }
          }
        }
      }

      stack.pop();
      permMark[name] = true;
      return false;
    }
    this.error.classList.add("hidden");
    for (let name in typedefDeps) {
      if (hasCycle(name)) {
        this.errorPath.textContent = cyclePath.join(" → ");
        this.error.classList.remove("hidden");
        return;
      }
    }

    if (Object.keys(typedefs).length) {
      this.root.traverse((n) => {
        if (!n.isAttribute) {
          let nodeTypes = n.nameValue.match(Node.nodeTypeRegEx) || [];
          let nodeTypeNames = nodeTypes.map((t) => t.slice(1));
          let prevNodeTypeNames = n.appliedNodeTypes || [];
          for (let t of prevNodeTypeNames) {
            if (!nodeTypeNames.includes(t)) {
              removeTypeApplication(n, t);
            }
          }
          n.appliedNodeTypes = Array.from(nodeTypeNames);
          if (nodeTypes) {
            for (let i = nodeTypes.length - 1; i >= 0; i--) {
              let t = nodeTypes[i].slice(1);
              if (typedefs[t]) {
                n.merge(typedefs[t], t);
              }
            }
          }
          let listTypes = n.nameValue.match(Node.listTypeRegEx) || [];
          let listTypeNames = listTypes.map((t) => t.slice(1));
          let prevListTypeNames = n.appliedListTypes || [];

          for (let t of prevListTypeNames) {
            if (!listTypeNames.includes(t)) {
              for (let child of n.nonAttrChildren) {
                removeTypeApplication(child, t);
              }
            }
          }

          n.appliedListTypes = Array.from(listTypeNames);
          if (listTypes) {
            for (let i = listTypes.length - 1; i >= 0; i--) {
              let t = listTypes[i].slice(1);
              if (typedefs[t]) {
                for (let child of n.nonAttrChildren) {
                  child.merge(typedefs[t], t);
                }
              }
            }
          }
        }
      });
    }
  }

  updateOutput() {
    if (this.root.nameValue.match(Node.typedefRegEx)) {
      this.root.widget;
      this.output.replaceChildren();
    } else if (
      !this.root.nameValue.startsWith("#") &&
      !this.root.nameValue.match(Node.attrRegEx)
    ) {
      this.output.replaceChildren(this.root.widget);
    } else {
      this.output.replaceChildren();
    }
  }

  updateNameSize() {
    let longestName = 0;
    this.root.traverse((n) => {
      if (!n.nameValue.startsWith("$url=")) {
        if (n.nameValue.length > longestName) {
          if (n.nameValue.length <= maxNameSize) {
            longestName = n.nameValue.length;
          } else {
            longestName = maxNameSize;
            return true;
          }
        }
      }
    });
    if (longestName > minNameSize) {
      this.root.traverse((n) => {
        n.name.size = longestName;
      });
    } else {
      this.root.traverse((n) => {
        n.name.size = minNameSize;
      });
    }
  }

  update(skipUpdateOutput) {
    this.updateTypes();
    if (!skipUpdateOutput) {
      this.updateOutput();
    }
    this.updateNameSize();
    let name = this.name;
    if (name) {
      document.title = name + " - TE";
    } else {
      document.title = "Tree Editor";
    }
  }
}

function removeTypeApplication(node, typeName) {
  node.traverse((n) => {
    for (let child of Array.from(n.children.children)) {
      if (
        child.node.sourceOwner == typeName &&
        child.node.sourceType &&
        child.node.equals(child.node.sourceType)
      ) {
        child.node.remove(false);
      }
    }
  });
}

export default new Tree();
