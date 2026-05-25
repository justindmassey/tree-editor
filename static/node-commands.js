import Node from "./node.js";
import tree from "./tree.js";
import history from "./history.js";
import { isArray } from "./exporters/json.js";
import { div, code } from "./lib/elements.js";
import crossRef from "./cross-ref.js";

export default {
  "Shift+Enter": {
    description: "Append child",
    action() {
      this.appendChild(new Node());
      history.add();
    },
  },
  "Alt+Shift+Enter": {
    description: "Prepend child",
    action() {
      this.prependChild(new Node());
      history.add();
    },
  },
  Enter: {
    description: "Insert a new node after this one",
    action() {
      if (this.parent) {
        this.insertAfter(new Node());
        history.add();
      }
    },
  },
  "Control+Alt+Enter": {
    description: "Insert a new node at the top",
    action() {
      if (this.parent) {
        this.parent.prependChild(new Node());
        history.add();
      }
    },
  },
  "Alt+Enter": {
    description: "Insert a new node after the parent node",
    action() {
      if (this.parent && this.parent.parent) {
        this.parent.insertAfter(new Node());
        history.add();
      }
    },
  },
  "Control+Enter": {
    description: "Add this node to a new parent node",
    action() {
      let newParent = addParent(this);
      newParent.focus();
      history.add();
    },
  },
  "Alt+c p": {
    description: "Add each child to a new parent",
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
    description: "Add each sibling to a new parent",
    action() {
      if (this.parent) {
        let newParent;
        for (let child of this.parent.children.children) {
          newParent = addParent(child.node);
          if (child.node == this) {
            newParent.focus();
          }
        }
        history.add();
      } else {
        let newParent = addParent(this);
        newParent.focus();
        history.add();
      }
    },
  },
  "Alt+i p": {
    description: "Add each node on this level to a new parent",
    action() {
      if (this.parent) {
        let newParent;
        for (let node of getNodesOnLevel(this)) {
          newParent = addParent(node);
          if (node == this) {
            newParent.focus();
          }
        }
        history.add();
      } else {
        let newParent = addParent(this);
        newParent.focus();
        history.add();
      }
    },
  },
  "Control+Shift+Enter": {
    description: "Add siblings to a new parent node",
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
    description: "Move this node up",
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
    description: "Move this node down",
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
    description: "Move this node to the top",
    action() {
      if (this.parent && this.parent.children.firstChild != this.elem) {
        this.parent.prependChild(this);
        history.add();
      }
    },
  },
  "Shift+ArrowDown": {
    description: "Move this node to the bottom",
    action() {
      if (this.parent && this.parent.children.lastChild != this.elem) {
        this.parent.appendChild(this);
        history.add();
      }
    },
  },
  "Alt+ArrowLeft": {
    description: "Promote node",
    action() {
      if (this.parent && this.parent.parent) {
        this.parent.insertAfter(this);
        history.add();
      }
    },
  },
  "Alt+ArrowRight": {
    description: "Demote node",
    action() {
      if (this.elem.previousSibling) {
        this.elem.previousSibling.node.appendChild(this);
        history.add();
      }
    },
  },
  "Alt+Shift+ArrowUp": {
    description: "Move siblings up",
    action() {
      if (this.parent && this.parent.children.children.length > 1) {
        this.parent.appendChild(this.parent.children.firstChild.node, false);
        this.focus();
        history.add();
      }
    },
  },
  "Alt+Shift+ArrowDown": {
    description: "Move siblings down",
    action() {
      if (this.parent && this.parent.children.children.length > 1) {
        this.parent.prependChild(this.parent.children.lastChild.node, false);
        this.focus();
        history.add();
      }
    },
  },
  "Control+d": {
    description: "Delete this node",
    action() {
      if (this.remove()) {
        history.add();
      }
    },
  },
  "Control+k": {
    description: "Delete this node but keep the children",
    action() {
      let toFocus = deleteAndKeepChildren(this);
      if (toFocus) {
        toFocus.focus();
        history.add();
      }
    },
  },
  "Alt+c k": {
    description: "Delete children but keep grandchildren",
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
    description: "Delete siblings but keep children",
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
  "Alt+i k": {
    description: "Delete nodes on this level but keep children",
    action() {
      if (this.parent) {
        let toFocus;
        for (let node of getNodesOnLevel(this)) {
          if (node == this) {
            toFocus = deleteAndKeepChildren(node);
          } else {
            deleteAndKeepChildren(node);
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
    description: "Delete descendants",
    action() {
      if (this.children.firstChild) {
        this.children.replaceChildren();
        history.add();
      }
    },
  },
  "Alt+s d": {
    description: "Delete siblings",
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
    description: "Delete nodes on this level",
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
    description: "Focus previous node",
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
    description: "Focus next node",
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
    description: "Focus previous sibling",
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
    description: "Focus next sibling",
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
    description: "Focus last sibling",
    action() {
      if (this.parent) {
        this.parent.children.lastChild.node.focus();
      }
    },
  },
  "Alt+u": {
    description: "Focus the parent node",
    action() {
      if (this.parent) {
        this.parent.focus();
      }
    },
  },
  "Alt+b": {
    description: "Focus the node edited before this one",
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
    description: "Focus the node edited after this one",
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
  "Alt+c j": {
    description: div(
      div("Focus first child containing text"),
      div("(case insensitive)"),
    ),
    action() {
      let find = prompt("Focus first child containing:").toUpperCase();
      for (let child of this.children.children) {
        if (child.node.nameValue.toUpperCase().includes(find)) {
          child.node.focus();
          return;
        }
      }
    },
  },
  "Alt+s j": {
    description: div(
      div("Focus first sibling containing text"),
      div("(case insensitive)"),
    ),
    action() {
      if (this.parent) {
        let find = prompt("Focus first sibling containing:").toUpperCase();
        for (let child of this.parent.children.children) {
          if (
            child.node.name != document.activeElement &&
            child.node.nameValue.toUpperCase().includes(find)
          ) {
            child.node.focus();
            return;
          }
        }
      }
    },
  },
  "Alt+a j": {
    description: div(
      div("Focus closest ancestor containing text"),
      div("(case insensitive)"),
    ),
    action() {
      let find = prompt("Focus closest ancestor containing:").toUpperCase();
      let search = this.parent;
      while (search) {
        if (search.nameValue.toUpperCase().includes(find)) {
          search.focus();
          return;
        }
        search = search.parent;
      }
    },
  },

  "Alt+i j": {
    description: div(
      div("Focus first node on this level"),
      div("containing text (case insensitive)"),
    ),
    action() {
      let find = prompt(
        "Focus first node on this level containing:",
      ).toUpperCase();
      for (let node of getNodesOnLevel(this)) {
        if (
          node.name != document.activeElement &&
          node.nameValue.toUpperCase().includes(find)
        ) {
          node.focus();
          return;
        }
      }
    },
  },

  "Alt+a k": {
    description: "Replace root with this node",
    action() {
      if (this.parent) {
        tree.root = this;
        this.focus();
        history.add();
      }
    },
  },
  Tab: {
    description: "Toggle visibility of children",
    action() {
      this.toggle();
    },
  },
  "Alt+f": {
    description: "Collapse all nodes and show this one",
    action() {
      tree.root.traverse((n) => n.collapse());
      this.focus();
    },
  },
  "Control+Alt+DIGIT": {
    description: div(
      div("Expand only nodes up to level ", code("DIGIT")),
      div("(relative to this node)"),
    ),
  },
  "Alt+c x": {
    description: "Expand children",
    action() {
      for (let child of this.children.children) {
        child.node.expand();
      }
    },
  },
  "Alt+c c": {
    description: "Collapse children",
    action() {
      for (let child of this.children.children) {
        child.node.collapse();
      }
    },
  },
  "Alt+s x": {
    description: "Expand siblings",
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
    description: "Collapse siblings",
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
    description: "Expand all descendants",
    action() {
      this.traverse((n) => n.expand());
    },
  },
  "Alt+d c": {
    description: "Collapse all descendants",
    action() {
      this.traverse((n) => n.collapse());
    },
  },
  "Alt+i x": {
    description: "Expand all nodes on this level",
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
    description: "Collapse all nodes on this level",
    action() {
      for (let node of getNodesOnLevel(this)) {
        node.collapse();
      }
    },
  },
  "Alt+c m": {
    description: "Move attribute children to top",
    action() {
      if (attsToTop(this)) {
        history.add();
      }
    },
  },
  "Alt+c s": {
    description: "Sort children",
    action() {
      if (sortNode(this)) {
        history.add();
      }
    },
  },
  "Alt+c r": {
    description: "Reverse children",
    action() {
      if (reverseNode(this)) {
        history.add();
      }
    },
  },
  "Alt+c g": {
    description: "Group children by attribute",
    action() {
      if (groupBy(this, prompt("Attribute to group by:"))) {
        history.add();
      }
    },
  },
  "Alt+c y": {
    description: "Shuffle children",
    action() {
      if (shuffleNode(this)) {
        history.add();
      }
    },
  },
  "Alt+c f": {
    description: "Flatten children",
    action() {
      if (flattenNode(this)) {
        history.add();
      }
    },
  },
  "Alt+c a": {
    description: "Children to array (for JSON export)",
    action() {
      if (nodeToArray(this)) {
        history.add();
      }
    },
  },
  "Alt+s m, Alt+.": {
    description: "Move attribute siblings to the top",
    action() {
      if (this.parent && attsToTop(this.parent, this)) {
        history.add();
      }
    },
  },
  "Alt+s s": {
    description: "Sort siblings",
    action() {
      if (this.parent && sortNode(this.parent)) {
        this.focus();
        history.add();
      }
    },
  },
  "Alt+s r": {
    description: "Reverse siblings",
    action() {
      if (this.parent && reverseNode(this.parent)) {
        this.focus();
        history.add();
      }
    },
  },
  "Alt+s g": {
    description: "Group siblings by attribute",
    action() {
      let attrName = prompt("Attribute to group by:");
      if (this.parent) {
        if (groupBy(this.parent, attrName)) {
          this.focus();
          history.add();
        }
      } else {
        let attrNode = this.getAttrNode(attrName);
        if (attrNode && !attrNode._isAttribute[1].startsWith("#")) {
          let newNode = new Node(attrNode._isAttribute[2]);
          this.replaceWith(newNode);
          newNode.appendChild(this, false);
          history.add();
        }
      }
    },
  },
  "Alt+s y": {
    description: "Shuffle siblings",
    action() {
      if (this.parent && shuffleNode(this.parent)) {
        this.focus();
        history.add();
      }
    },
  },
  "Alt+s f": {
    description: "Flatten siblings",
    action() {
      if (this.parent && flattenNode(this.parent)) {
        this.focus();
        history.add();
      }
    },
  },
  "Alt+s a": {
    description: "Siblings to array (for JSON export)",
    action() {
      if (this.parent) {
        if (nodeToArray(this.parent)) {
          this.focus();
          history.add();
        }
      } else {
        if (this.isAttribute) {
          if (this._isAttribute[1] != "0") {
            this._nameValue = 0 + "=" + this._isAttribute[2];
            history.add();
          }
        } else {
          if (this.nameValue != "0") {
            this._nameValue = 0;
            history.add();
          }
        }
      }
    },
  },
  "Alt+i f": {
    description: "flatten nodes on this level",
    action() {
      let flattened = false;
      for (let node of getNodesOnLevel(this)) {
        if (flattenNode(node)) {
          flattened = true;
        }
      }
      if (flattened) {
        history.add();
      }
    },
  },
  "Alt+w": {
    description: div("Flash the nodes widget ", crossRef("Widgets")),
    action() {
      if (this.outputs) {
        for (let out of this.outputs) {
          out.classList.remove("flash");
          out.offsetWidth;
          out.classList.add("flash");
        }
      }
    },
  },
  "Alt+x w": {
    description: div(
      div("Remove widget prefix ", crossRef("Widgets")),
      div(" and ", code("$"), "-attributes ", crossRef("Attributes")),
    ),
    action() {
      let prefix = /^-[^\s.:]+\s*/;
      let changed = false;
      if (prefix.test(this.nameValue)) {
        this._nameValue = this.nameValue.replace(prefix, "");
        this.name.selectionStart = 0;
        this.name.selectionEnd = 0;
        changed = true;
      }
      for (let att of this.attrNodes) {
        if (att._isAttribute[1].startsWith("$")) {
          att.remove(false);
          changed = true;
        }
      }
      if (changed) {
        history.add();
        this.updateLastValues();
      }
    },
  },
  "Alt+x d": {
    description: "Insert current date and time",
    action() {
      let name = this.nameValue;
      let date = new Date()
        .toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
        .replaceAll(".", "\\.")
        .replaceAll(":", "\\:");
      let cursorPos = this.name.selectionStart + date.length;
      this._nameValue =
        name.slice(0, this.name.selectionStart) +
        date +
        name.slice(this.name.selectionEnd);
      this.name.selectionStart = cursorPos;
      this.name.selectionEnd = cursorPos;
      history.add();
      this.updateLastValues();
    },
  },
  "Control+g": {
    description: "Clear the current prefix command",
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

function groupBy(node, attrName) {
  let groups = new Map();
  for (let child of node.children.children) {
    for (let attr of child.node.attrNodes) {
      if (attr.attrNameText == attrName) {
        let groupName = attr._isAttribute[2];
        if (groups.has(groupName)) {
          groups.get(groupName).push(child.node);
        } else {
          groups.set(groupName, [child.node]);
        }
      }
    }
  }
  let lastInserted;
  let groupNodes = [];
  for (let [groupName, nodes] of groups) {
    let groupNode = new Node(groupName);
    for (let node of nodes) {
      groupNode.appendChild(node, false);
    }
    if (lastInserted) {
      lastInserted.insertAfter(groupNode, false);
    } else {
      node.prependChild(groupNode, false);
    }
    lastInserted = groupNode;
    groupNodes.push(groupNode);
  }
  for (let groupNode of groupNodes) {
    if (!groupNode.children.children.length) {
      groupNode.remove(false);
    }
  }
  return groups.size;
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
      let child = node.children.children[i];
      if (child.node.isAttribute) {
        child.node._nameValue = i + "=" + child.node._isAttribute[2];
      } else {
        child.node._nameValue = i;
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
