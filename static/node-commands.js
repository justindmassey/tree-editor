import Node from "./node.js";
import tree from "./tree.js";
import history from "./history.js";
import { isArray } from "./exporters/json.js";
import { div, code } from "./lib/elements.js";

export default {
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
  "Control+Alt+Enter": {
    description: "insert a new node at the top",
    action() {
      if (this.parent) {
        this.parent.prependChild(new Node());
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
      let newParent = addParent(this);
      newParent.focus();
      history.add();
    },
  },
  "Alt+c p": {
    description: "add each child to a new parent",
    action() {
      if (this.children.children.length) {
        for (let child of this.children.children) {
          addParent(child.node);
        }
        history.add();
      }
    },
  },
  "Alt+s p": {
    description: "add each sibling to a new parent",
    action() {
      if (this.parent) {
        let newParent;
        if (this.parent.children.children.length) {
          for (let child of this.parent.children.children) {
            newParent = addParent(child.node);
            if (child.node == this) {
              newParent.focus();
            }
          }
          history.add();
        }
      } else {
        let newParent = addParent(this);
        newParent.focus();
        history.add();
      }
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
  "Shift+ArrowUp": {
    description: "move this node to the top",
    action() {
      if (this.parent && this.parent.children.firstChild != this.elem) {
        this.parent.prependChild(this);
        history.add();
      }
    },
  },
  "Shift+ArrowDown": {
    description: "move this node to the bottom",
    action() {
      if (this.parent && this.parent.children.lastChild != this.elem) {
        this.parent.appendChild(this);
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
  "Alt+Shift+ArrowUp": {
    description: "move siblings up",
    action() {
      if (this.parent && this.parent.children.children.length > 1) {
        this.parent.appendChild(this.parent.children.firstChild.node, false);
        this.focus();
        history.add();
      }
    },
  },
  "Alt+Shift+ArrowDown": {
    description: "move siblings down",
    action() {
      if (this.parent && this.parent.children.children.length > 1) {
        this.parent.prependChild(this.parent.children.lastChild.node, false);
        this.focus();
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
      let toFocus = deleteAndKeepChildren(this);
      if (toFocus) {
        toFocus.focus();
        history.add();
      }
    },
  },
  "Alt+c k": {
    description: "delete children but keep grandchildren",
    action() {
      if (this.children.children.length) {
        for (let child of Array.from(this.children.children)) {
          deleteAndKeepChildren(child.node);
        }
        this.focus();
        history.add();
      }
    },
  },
  "Alt+s k": {
    description: "delete siblings but keep children",
    action() {
      if (this.parent) {
        let toFocus;
        for (let child of Array.from(this.parent.children.children)) {
          if (child.node == this) {
            toFocus = deleteAndKeepChildren(child.node);
          } else {
            deleteAndKeepChildren(child.node);
          }
        }
        toFocus.focus();
        history.add();
      } else {
        let toFocus = deleteAndKeepChildren(this);
        if (toFocus) {
          toFocus.focus();
          history.add();
        }
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
  "Alt+s d": {
    description: "delete siblings",
    action() {
      if (this.parent) {
        if (this.parent.children.children.length) {
          this.parent.children.replaceChildren();
          this.parent.focus();
          history.add();
        }
      } else {
        if (this.remove()) {
          history.add();
        }
      }
    },
  },
  "Alt+i d": {
    description: "delete nodes on the same level",
    action() {
      let nodesOnLevel = getNodesOnLevel(this);
      if (this.parent) {
        for (let node of nodesOnLevel) {
          node.remove(false);
        }
        this.parent.focus();
        history.add();
      } else if (this.remove()) {
        this.focus();
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
  "Alt+l": {
    description: "focus last sibling",
    action() {
      if (this.parent) {
        this.parent.children.lastChild.node.focus();
      }
    },
  },
  "Control+u": {
    description: "focus the parent node",
    action() {
      if (this.parent) {
        this.parent.focus();
      }
    },
  },
  "Alt+b": {
    description: "focus the node edited before this one",
    action() {
      let nodes = [];
      tree.root.traverse((node) => {
        nodes.push(node);
      });
      nodes.sort((a, b) => a.lastModified - b.lastModified);
      let prevEdited = nodes[nodes.indexOf(this) - 1];
      if (prevEdited) {
        prevEdited.focus();
      }
    },
  },
  "Alt+v": {
    description: "focus the node edited after this one",
    action() {
      let nodes = [];
      tree.root.traverse((node) => {
        nodes.push(node);
      });
      nodes.sort((a, b) => a.lastModified - b.lastModified);
      let nextEdited = nodes[nodes.indexOf(this) + 1];
      if (nextEdited) {
        nextEdited.focus();
      }
    },
  },
  "Alt+d r": {
    description: "replace root with this node",
    action() {
      if (this.parent) {
        tree.root = this;
        this.focus();
        history.add();
      }
    },
  },
  Tab: {
    description: "toggle visibility of children",
    action() {
      this.toggle();
    },
  },
  "Alt+f": {
    description: "collapse all nodes and show this one",
    action() {
      tree.root.traverse((n) => n.collapse());
      this.focus();
    },
  },
  "Control+Alt+DIGIT": {
    description: div(
      div("expand only nodes up to level ", code("DIGIT")),
      div("(relative to this node)"),
    ),
  },
  "Alt+c x": {
    description: "expand children",
    action() {
      for (let child of this.children.children) {
        child.node.expand();
      }
    },
  },
  "Alt+c c": {
    description: "collapse children",
    action() {
      for (let child of this.children.children) {
        child.node.collapse();
      }
    },
  },
  "Alt+s x": {
    description: "expand siblings",
    action() {
      if (this.parent) {
        for (let sibling of this.parent.children.children) {
          sibling.node.expand();
        }
      } else {
        this.expand();
      }
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
  "Alt+i x": {
    description: "expand all nodes on this level",
    action() {
      for (let node of getNodesOnLevel(this)) {
        if (node.parent) {
          node.parent.traverseUp((n) => n.expand());
        }
        node.expand();
      }
    },
  },
  "Alt+i c": {
    description: "collapse all nodes on this level",
    action() {
      for (let node of getNodesOnLevel(this)) {
        node.collapse();
      }
    },
  },
  "Alt+c m": {
    description: "move attribute children to top",
    action() {
      if (attsToTop(this)) {
        history.add();
      }
    },
  },
  "Alt+c s": {
    description: "sort children",
    action() {
      if (sortNode(this)) {
        history.add();
      }
    },
  },
  "Alt+c r": {
    description: "reverse children",
    action() {
      if (reverseNode(this)) {
        history.add();
      }
    },
  },
  "Alt+c f": {
    description: "shuffle children",
    action() {
      if (shuffleNode(this)) {
        history.add();
      }
    },
  },
  "Alt+c f": {
    description: "flatten children",
    action() {
      if (flattenNode(this)) {
        history.add();
      }
    },
  },
  "Alt+c a": {
    description: "children to array (for JSON export)",
    action() {
      if (nodeToArray(this)) {
        history.add();
      }
    },
  },
  "Alt+s m, Alt+y": {
    description: "move attribute siblings to the top",
    action() {
      if (this.parent && attsToTop(this.parent, this)) {
        history.add();
      }
    },
  },
  "Alt+s s": {
    description: "sort siblings",
    action() {
      if (this.parent && sortNode(this.parent)) {
        this.focus();
        history.add();
      }
    },
  },
  "Alt+s r": {
    description: "reverse siblings",
    action() {
      if (this.parent && reverseNode(this.parent)) {
        this.focus();
        history.add();
      }
    },
  },
  "Alt+s f": {
    description: "shuffle siblings",
    action() {
      if (this.parent && shuffleNode(this.parent)) {
        this.focus();
        history.add();
      }
    },
  },
  "Alt+s f": {
    description: "flatten siblings",
    action() {
      if (this.parent && flattenNode(this.parent)) {
        this.focus();
        history.add();
      }
    },
  },
  "Alt+s a": {
    description: "siblings to array (for JSON export)",
    action() {
      if (this.parent) {
        if (nodeToArray(this.parent)) {
          this.focus();
          history.add();
        }
      } else {
        if (this.isAttribute) {
          if (this._isAttribute[1] != "0") {
            this.nameValue = 0 + "=" + this._isAttribute[2];
            history.add();
          }
        } else {
          if (this.nameValue != "0") {
            this.nameValue = 0;
            history.add();
          }
        }
      }
    },
  },
  "Control+g": {
    description: "clear the current prefix command",
    action() {
      tree.toast.pop("Prefix command cleared");
    },
  },
};

function addParent(node) {
  let parent = new Node();
  node.replaceWith(parent, false);
  parent.appendChild(node, false);
  return parent;
}

function deleteAndKeepChildren(node) {
  if (node.parent) {
    if (node.children.children.length) {
      let firstChild = node.children.firstChild.node;
      for (let i = node.children.children.length - 1; i >= 0; i--) {
        node.insertAfter(node.children.children[i].node);
      }
      node.remove(false);
      return firstChild;
    } else {
      return node.remove();
    }
  } else if (node.children.children.length == 1) {
    let newRoot = node.children.firstChild.node;
    node.replaceWith(newRoot);
    return newRoot;
  } else if (node.nameValue) {
    node.nameValue = "";
    return node;
  }
}

function attsToTop(node, focus) {
  let prevChildren = Array.from(node.children.children);
  let lastAttribute;
  for (let child of prevChildren) {
    if (child.node.isAttribute) {
      if (lastAttribute) {
        lastAttribute.insertAfter(child.node, false);
      } else {
        node.prependChild(child.node, false);
      }
      lastAttribute = child.node;
    }
  }
  if (focus) {
    focus.focus();
  }
  for (let i = 0; i < prevChildren.length; i++) {
    if (prevChildren[i] != node.children.children[i]) {
      return true;
    }
  }
}

function sortNode(node) {
  if (node.children.children.length > 1) {
    let childrenBefore = Array.from(node.children.children);
    let sorted = childrenBefore.toSorted((a, b) => {
      return a.node.nameValue.localeCompare(b.node.nameValue);
    });
    for (let i = 0; i < childrenBefore.length; i++) {
      if (childrenBefore[i] != sorted[i]) {
        node.children.replaceChildren(...sorted);
        return true;
      }
    }
  }
}

function reverseNode(node) {
  if (node.children.children.length > 1) {
    for (let child of Array.from(node.children.children)) {
      node.prependChild(child.node, false);
    }
    return true;
  }
}

function shuffleNode(node) {
  if (node.children.children.length > 1) {
    let childrenBefore = Array.from(node.children.children);
    let shuffled = Array.from(childrenBefore);
    for (let i = shuffled.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    for (let i = 0; i < childrenBefore.length; i++) {
      if (childrenBefore[i] != shuffled[i]) {
        node.children.replaceChildren(...shuffled);
        return true;
      }
    }
  }
}

function flattenNode(node) {
  let flatten = false;
  for (let child of node.children.children) {
    if (child.node.children.children.length) {
      flatten = true;
      break;
    }
  }
  if (flatten) {
    let descendants = [];
    node.traverse((descendant) => {
      descendants.push(descendant);
    });
    descendants.shift();

    node.children.replaceChildren();
    for (let descendant of descendants) {
      node.appendChild(descendant, false);
    }
    return true;
  }
}

function nodeToArray(node) {
  if (!isArray(node)) {
    for (let i = 0; i < node.children.children.length; i++) {
      let child = node.children.children[i].node;
      if (child.isAttribute) {
        child.nameValue = i + "=" + child._isAttribute[2];
      } else {
        child.nameValue = i;
      }
    }
    return true;
  }
}

function getNodesOnLevel(node) {
  let nodeLevel = node.level;
  let nodesOnLevel = [];
  tree.root.traverse((node, level) => {
    if (level == nodeLevel) {
      nodesOnLevel.push(node);
    }
  });
  return nodesOnLevel;
}
