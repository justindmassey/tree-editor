import Node from "./node.js";
import tree from "./tree.js";
import history from "./history.js";

export default {
  Tab: {
    description: "toggle visibility of children",
    action() {
      this.toggle();
    },
  },
  "Shift+Enter": {
    description: "prepend a new child node",
    action() {
      this.prependChild(new Node());
      history.add();
    },
  },
  Enter: {
    description: "insert a new node after this one",
    action() {
      if (this.parent) {
        this.insertAfter(new Node());
        history.add();
      }
    },
  },
  "Alt+Enter": {
    description: "append child to grandparent",
    action() {
      if (this.parent && this.parent.parent) {
        this.parent.parent.appendChild(new Node());
        history.add();
      }
    },
  },
  "Control+d": {
    description: "delete this node",
    action() {
      if (this.remove()) {
        history.add();
      }
    },
  },
  "Alt+ArrowUp, Control+Alt+p": {
    description: "focus previous sibling",
    action() {
      if (this.parent) {
        if (this.elem.previousSibling) {
          this.elem.previousSibling.node.focus();
        } else {
          this.parent.children.lastChild.node.focus();
        }
      }
    },
  },
  "Alt+ArrowDown, Control+Alt+n": {
    description: "focus next sibling",
    action() {
      if (this.parent) {
        if (this.elem.nextSibling) {
          this.elem.nextSibling.node.focus();
        } else {
          this.parent.children.firstChild.node.focus();
        }
      }
    },
  },
  "Shift+ArrowUp, Alt+Shift+P": {
    description: "move this node up",
    action() {
      if (this.parent && this.parent.children.children.length > 1) {
        this.parent.children.insertBefore(this.elem, this.elem.previousSibling);
        this.focus();
        history.add();
      }
    },
  },
  "Shift+ArrowDown, Alt+Shift+N": {
    description: "move this node down",
    action() {
      if (this.parent && this.parent.children.children.length > 1) {
        if (this.elem.nextSibling) {
          this.elem.nextSibling.after(this.elem);
        } else {
          this.parent.prependChild(this);
        }
        this.focus();
        history.add();
      }
    },
  },
  "Control+Enter": {
    description: "add a new parent node",
    action() {
      parent = new Node();
      this.replaceWith(parent);
      parent.appendChild(this, false);
      history.add();
    },
  },
  "Control+Shift+Enter": {
    description: "add new parent to siblings",
    action() {
      if (this.parent) {
        let newParent = new Node();
        newParent.children.replaceChildren(...this.parent.children.children);
        this.parent.appendChild(newParent);
        for (let child of newParent.children.children) {
          child.node.parent = newParent;
        }
      } else {
        parent = new Node();
        this.replaceWith(parent);
        parent.appendChild(this, false);
      }
      history.add();
    },
  },
  "Control+k": {
    description: "remove this node but keep the children",
    action() {
      if (this.parent) {
        if (this.children.children.length) {
          for (let i = this.children.children.length - 1; i >= 0; i--) {
            this.insertAfter(this.children.children[i].node);
          }
          this.remove(false);
        } else {
          this.remove();
        }
        history.add();
      } else if (this.children.children.length == 1) {
        this.replaceWith(this.children.children[0].node);
        history.add();
      }
    },
  },
  "ArrowUp, Alt+p": {
    description: "focus previous node",
    action() {
      if (this.elem.previousSibling) {
        let lastNode;
        this.elem.previousSibling.node.traverse((n) => {
          lastNode = n;
        }, false);
        lastNode.focus();
      } else if (this.parent) {
        this.parent.focus();
      } else {
        let lastNode;
        tree.root.traverse((n) => {
          lastNode = n;
        }, false);
        lastNode.focus();
      }
    },
  },
  "ArrowDown, Alt+n": {
    description: "focus next node",
    action() {
      if (this.children.children.length && this.expanded) {
        this.children.children[0].node.focus();
      } else if (this.elem.nextSibling) {
        this.elem.nextSibling.node.focus();
      } else {
        this.parent.traverseUp((node) => {
          if (node.elem.nextSibling) {
            node.elem.nextSibling.node.focus();
            return true;
          } else {
            tree.root.focus();
          }
        });
      }
    },
  },
  "Control+p": {
    description: "focus the parent node",
    action() {
      if (this.parent) {
        this.parent.focus();
      }
    },
  },
  "Alt+c": {
    description: "copy node to clipboard",
    action() {
      tree.clipboard = this.serialize();
    },
  },
  "Alt+x": {
    description: "cut node to clipboard",
    action() {
      tree.clipboard = this.serialize();
      if (this.remove()) {
        history.add();
      }
    },
  },
  "Alt+v": {
    description: "replace node with clipboard",
    action() {
      if (tree.clipboard) {
        this.replaceWith(Node.deserialize(tree.clipboard));
        history.add();
      }
    },
  },
  "Alt+d d": {
    description: "delete descendants",
    action() {
      if (this.children.firstChild) {
        this.children.replaceChildren();
        history.add();
      }
    },
  },
  "Alt+d a": {
    description: "delete all attribute children",
    action() {
      let removed = false;
      let children = Array.from(this.children.children);
      for (let child of children) {
        if (child.node.isAttribute) {
          if (child.node.remove(false)) {
            removed = true;
          }
        }
      }
      if (removed) {
        history.add();
      }
    },
  },
  "Alt+d r": {
    description: "replace root with this node",
    action() {
      tree.root = this;
      this.focus();
      history.add();
    },
  },
  "Alt+s": {
    description: "collapse siblings",
    action() {
      if (this.parent) {
        for (let sibling of this.parent.children.children) {
          sibling.node.collapse();
        }
      } else {
        this.collapse();
      }
    },
  },
  "Alt+a": {
    description: "collaps all descendants with only attribute children",
    action() {
      this.traverse((node) => {
        if (!node.nonAttrChildren.length) {
          node.collapse();
        }
      }, false);
    },
  },
  "Alt+d x": {
    description: "expand all descendants",
    action() {
      this.traverse((n) => n.expand());
    },
  },
  "Alt+d c": {
    description: "collapse all descendants",
    action() {
      this.traverse((n) => n.collapse());
    },
  },
  "Control+g": {
    description: "clear the current prefix command",
    action() {},
  },
};
