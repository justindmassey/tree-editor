import Node from "./node.js";
import { div } from "./lib/elements.js";
import history from "./history.js";
import { get } from "./lib/ajax.js";
import typedefMenu from "./typedef-menu.js";

const minNameSize = 40;
const maxNameSize = 80;

class Tree {
  constructor() {
    this.tree = div().c("tree-container");
    this.output = div().c("output", "hidden");
    window.addEventListener("keydown", (ev) => {
      if (ev.key == "Control") {
        this.output.classList.add("default-cursor");
      }
    });
    window.addEventListener("keyup", (ev) =>
      this.output.classList.remove("default-cursor"),
    );
    this.elem = div(this.tree, this.output).c("tree");
    this.clipboard = null;
    this.root = new Node();
  }

  load(name, escapedName = name) {
    get("/trees/" + encodeURIComponent(name)).then((data) => {
      if (data.error) {
        this.root = new Node(escapedName);
        this.root.focus();
        history.add();
        this.tree.scrollTop = 0;
        this.output.scrollTop = 0;
      } else {
        this.root = Node.deserialize(data);
        this.tree.scrollTop = 0;
        this.output.scrollTop = 0;
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
    let getTypeClosure = (typeName, result = new Set()) => {
      if (result.has(typeName)) return result;
      result.add(typeName);
      let deps = typedefDeps[typeName];
      if (deps) {
        for (let dep of deps) {
          if (typedefs[dep]) {
            getTypeClosure(dep, result);
          }
        }
      }
      return result;
    };
    let removeTypeApplication = (node, typeName) => {
      let ownerTypes = getTypeClosure(typeName);

      node.traverse((n) => {
        for (let child of [...n.children.children]) {
          if (
            ownerTypes.has(child.node.sourceOwner) &&
            child.node.sourceType &&
            child.node.equals(child.node.sourceType)
          ) {
            child.node.remove(false);
          }
        }
      });
    };
    typedefMenu.clearItems();
    this.root.traverse((n) => {
      if (!n.isAttribute) {
        let m = n.name.value.match(Node.typedefRegEx);
        if (m) {
          typedefs[m[1]] = n;
          typedefDeps[m[1]] = typedefDeps[m[1]] || new Set();
          typedefMenu.addItem(div(m[1]).e("click", () => n.focus()));
          n.traverse((n2) => {
            let nodeTypes = n2.name.value.match(Node.nodeTypeRegEx);
            if (nodeTypes) {
              for (let t of nodeTypes) {
                typedefDeps[m[1]].add(t.slice(1));
              }
            }
            let listTypes = n2.name.value.match(Node.listTypeRegEx);
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

    const visit = (name, stack) => {
      if (permMark[name]) return false;
      if (tempMark[name]) {
        cyclePath = stack.concat(name);
        return name;
      }
      tempMark[name] = true;
      stack.push(name);

      let deps = typedefDeps[name];
      if (deps) {
        for (let dep of deps) {
          if (typedefDeps[dep]) {
            let t;
            if ((t = visit(dep, stack))) return t;
          }
        }
      }

      stack.pop();
      permMark[name] = true;
      return false;
    };

    for (let name in typedefDeps) {
      let t;
      if ((t = visit(name, []))) {
        alert("Fixing recursive type: " + cyclePath.join(" → "));
        if ("value" in document.activeElement) {
          let prevName = document.activeElement.value;
          let re1 = new RegExp("(?<!(?<!\\\\)\\\\)" + regex("." + t), "g");
          let re2 = new RegExp("(?<!:|((?<!\\\\)\\\\))" + regex(":" + t), "g");
          document.activeElement.value = document.activeElement.value
            .replace(re1, "")
            .replace(re2, "");
          if (prevName != document.activeElement.value) {
            this.updateTypes();
          }
        }
        return;
      }
    }

    if (Object.keys(typedefs).length) {
      this.root.traverse((n) => {
        if (!n.isAttribute) {
          let nodeTypes = n.name.value.match(Node.nodeTypeRegEx) || [];
          let nodeTypeNames = nodeTypes.map((t) => t.slice(1));
          let prevNodeTypeNames = n.appliedNodeTypes || [];
          for (let t of prevNodeTypeNames) {
            if (!nodeTypeNames.includes(t)) {
              removeTypeApplication(n, t);
            }
          }
          n.appliedNodeTypes = [...nodeTypeNames];
          if (nodeTypes) {
            for (let i = nodeTypes.length - 1; i >= 0; i--) {
              let t = nodeTypes[i].slice(1);
              if (typedefs[t]) {
                typedefs[t].widget;
                n.merge(typedefs[t], t);
              }
            }
          }
          let listTypes = n.name.value.match(Node.listTypeRegEx) || [];
          let listTypeNames = listTypes.map((t) => t.slice(1));
          let prevListTypeNames = n.appliedListTypes || [];

          for (let t of prevListTypeNames) {
            if (!listTypeNames.includes(t)) {
              for (let child of n.nonAttrChildren) {
                removeTypeApplication(child, t);
              }
            }
          }

          n.appliedListTypes = [...listTypeNames];
          if (listTypes) {
            for (let i = listTypes.length - 1; i >= 0; i--) {
              let t = listTypes[i].slice(1);
              if (typedefs[t]) {
                for (let child of n.nonAttrChildren) {
                  typedefs[t].widget;
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
    if (
      this.root.name.value.startsWith("#") ||
      this.root.name.value.match(Node.typedefRegEx) ||
      this.root.name.value.match(Node.attrRegEx)
    ) {
      this.output.replaceChildren();
    } else {
      this.output.replaceChildren(this.root.widget);
    }
  }

  updateNameSize() {
    let longestName = 0;
    this.root.traverse((n) => {
      if (!n.name.value.startsWith("$url=")) {
        if (n.name.value.length > longestName) {
          if (n.name.value.length <= maxNameSize) {
            longestName = n.name.value.length;
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

function regex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default new Tree();
