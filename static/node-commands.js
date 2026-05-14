import Node from "./node.js";
import tree from "./tree.js";
import history from "./history.js";
import exportToText from "./exporters/tree.js";

export default {
  Tab: {
    description: "toggle visibility of children",
    action() {
      this.toggle();
    },
  },
  "Shift+Enter": {
    description: "append child",
    action() {
      this.appendChild(new Node());
      history.add();
    },
  },
  "Alt+Shift+Enter": {
    description: "prepend child",
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
    description: "insert a new node after the parent node",
    action() {
      if (this.parent && this.parent.parent) {
        this.parent.insertAfter(new Node());
        history.add();
      }
    },
  },
  "Control+Enter": {
    description: "add this node to a new parent node",
    action() {
      let parent = new Node();
      this.replaceWith(parent);
      parent.appendChild(this, false);
      history.add();
    },
  },
  "Control+Shift+Enter": {
    description: "add siblings to a new parent node",
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
  "Alt+ArrowUp, Alt+Shift+P": {
    description: "move this node up",
    action() {
      if (this.parent && this.parent.children.children.length > 1) {
        if (this.elem.previousSibling) {
          this.elem.previousSibling.before(this.elem);
        } else {
          this.parent.appendChild(this);
        }
        this.focus();
        history.add();
      }
    },
  },
  "Alt+ArrowDown, Alt+Shift+N": {
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
  "Alt+ArrowLeft": {
    description: "promote node",
    action() {
      if (this.parent && this.parent.parent) {
        this.parent.insertAfter(this);
        history.add();
      }
    },
  },
  "Alt+ArrowRight": {
    description: "demote node",
    action() {
      if (this.elem.previousSibling) {
        this.elem.previousSibling.node.appendChild(this);
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
  "Control+k": {
    description: "delete this node but keep the children",
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
      } else if (this.nameValue) {
        this.nameValue = "";
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
  ArrowUp: {
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
  ArrowDown: {
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
  "Control+ArrowUp, Control+Alt+p": {
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
  "Control+ArrowDown, Control+Alt+n": {
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
  "Alt+p": {
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
  "Alt+y": {
    description: "merge clipboard into this node",
    action() {
      if (tree.clipboard) {
        this.merge(Node.deserialize(tree.clipboard), false);
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
  "Alt+f": {
    description: "collapse all nodes and show this one",
    action() {
      tree.root.traverse((n) => n.collapse());
      this.focus();
    },
  },
  "Alt+s c": {
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
  "Alt+s s": {
    description: "sort siblings",
    action() {
      if (this.parent) {
        let text = exportToText(this.parent);
        this.parent.children.replaceChildren(
          ...Array.from(this.parent.children.children).sort((a, b) => {
            return a.node.nameValue > b.node.nameValue ? 1 : -1;
          }),
        );
        this.focus();
        if (text != exportToText(this.parent)) {
          history.add();
        }
      }
    },
  },
  "Alt+i": {
    description: "siblings to array (for JSON export)",
    action() {
      if (this.parent) {
        let text = exportToText(this.parent);
        for (let i = 0; i < this.parent.children.children.length; i++) {
          let child = this.parent.children.children[i].node;
          if (child.isAttribute) {
            child.nameValue = i + "=" + child._isAttribute[2];
          } else {
            child.nameValue = i;
          }
        }
        if (exportToText(this.parent) != text) {
          history.add();
        }
      }
    },
  },
  "Control+g": {
    description: "clear the current prefix command",
    action() {},
  },
};
