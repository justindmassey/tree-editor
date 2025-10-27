import registerShortcuts from "./lib/register-shortcuts.js";
import nodeCommands from "./node-commands.js";
import { div, input, ol, li } from "./lib/elements.js";
import widgets from "./widgets.js";
import history from "./history.js";
import moveElementToIndex from "./lib/move-element-to-index.js";

export default class Node {
  static attrRegEx = /^((?:[^=]|\\=)*)(?<!\\)=(.*)$/;
  static widgetRegEx = /^(-\S+)\s*(.*)/;
  static nodeTypeRegEx = /(?<!\\)\.[^\.:\s]+/g;
  static listTypeRegEx = /(?<!:|\\):[^\.:\s]+/g;
  static typedefRegEx = /^::(\S+)/;

  constructor(name = "", ...children) {
    this.toggleButton = div()
      .c("button", "toggle-button")
      .e("click", () => this.toggle());
    this.name = input()
      .c("name")
      .a("size", 40)
      .e("input", () => {
        history.add();
        this.lastName = this.name.value;
      });
    registerShortcuts(this.name, nodeCommands, this);
    this.name.value = name;
    this.lastName = name;
    this.removeButton = div("✕")
      .c("button", "remove-button")
      .e("click", () => {
        if (this.remove()) {
          history.add();
        }
      });
    this.children = div().c("children");
    this.elem = div(
      this.toggleButton,
      this.name,
      this.removeButton,
      this.children
    ).c("node");
    this.elem.node = this;
    for (let child of children) {
      this.appendChild(child, false);
    }
    this.expand();
  }

  copy() {
    let n = new Node(this.name.value);
    n.lastName = this.lastName;
    n.lastAttrName = this.lastAttrName;
    for (let child of this.children.children) {
      n.appendChild(child.node.copy());
    }
    return n;
  }

  getChild(name) {
    for (let child of this.children.children) {
      if (child.node.name.value == name) {
        return child.node;
      }
    }
  }

  getAttrNode(name) {
    for (let child of this.children.children) {
      let m = child.node.isAttribute;
      if (m && m[1] == name) {
        return child.node;
      }
    }
  }

  merge(node, removeLastName = true) {
    let activeElement = document.activeElement;
    let n = node.copy();
    let children = Array.from(n.children.children);
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      if (removeLastName) {
        let prevNode = this.getChild(child.node.lastName);
        if (prevNode && child.node.lastName != child.node.name.value) {
          prevNode.remove(false);
        }
      }
      let m = child.node.isAttribute;
      if (m) {
        if (!(m[1] in this.attributes)) {
          this.setAttribute(m[1], m[2]);
        }
        moveElementToIndex(this.getAttrNode(m[1]).elem, i);
      } else {
        if (!this.getChild(child.node.name.value)) {
          this.appendChild(child.node, false);
        }
        moveElementToIndex(this.getChild(child.node.name.value).elem, i);
      }
    }
    for (let child1 of this.nonAttrChildren) {
      for (let child2 of n.nonAttrChildren) {
        if (child1.name.value == child2.name.value) {
          child1.merge(child2);
        }
      }
    }
    activeElement.focus();
  }

  setAttribute(name, value = "", focus = false) {
    name = name.replace(/=/g, "\\=").replace(/^-/, "\\-");
    for (let i = this.children.children.length - 1; i >= 0; i--) {
      let child = this.children.children[i];
      if (child.node.name.value.startsWith(name + "=")) {
        child.node.name.value = name + "=" + value;
        if (focus) {
          child.node.focus();
        }
        return;
      }
    }
    let attr = new Node(name + "=" + value);
    this.appendChild(attr, focus);
  }

  get attributes() {
    this._attributes = {};
    for (let child of this.children.children) {
      let m = child.node.isAttribute;
      if (m) {
        this._attributes[unescape(m[1])] = unescapeValue(m[2]);
      }
    }
    return this._attributes;
  }

  get isAttribute() {
    return this.name.value.match(Node.attrRegEx);
  }

  toElement() {
    let m = this.name.value.match(Node.widgetRegEx);
    if (m && widgets[m[1]]) {
      return widgets[m[1]].create(this, unescapeValue(m[2]));
    } else {
      let children = ol();
      for (let child of this.nonAttrChildren) {
        if (!child.name.value.match(Node.typedefRegEx)) {
          children.appendChild(li(child.toElement()));
        }
      }

      if (children.children.length) {
        return div(div(this.nameText), children);
      } else {
        return div(this.nameText);
      }
    }
  }

  get nonAttrChildren() {
    this._nonAttrChildren = [];
    for (let child of this.children.children) {
      if (!child.node.isAttribute) {
        this._nonAttrChildren.push(child.node);
      }
    }
    return this._nonAttrChildren;
  }

  get nameText() {
    this._nameText = unescape(this.name.value) || " ";
    return this._nameText;
  }

  traverseUp(callback) {
    if (callback(this)) {
      return;
    } else if (this.parent) {
      this.parent.traverseUp(callback);
    }
  }

  traverse(callback, includeCollapsed = true) {
    if (callback(this)) {
      return true;
    } else if (includeCollapsed || this.expanded) {
      for (let child of this.children.children) {
        if (child.node.traverse(callback, includeCollapsed)) {
          return true;
        }
      }
    }
  }

  serialize() {
    let node = {
      name: this.name.value,
      collapsed: this.collapsed,
      children: [],
    };
    if (this.name == document.activeElement) {
      node.selectionStart = this.name.selectionStart;
      node.selectionEnd = this.name.selectionEnd;
    }
    for (let child of this.children.children) {
      node.children.push(child.node.serialize());
    }
    return node;
  }

  static deserialize(node) {
    let n = new Node(node.name);
    if (node.collapsed) {
      n.collapse();
    }
    if (node.selectionStart != undefined) {
      setTimeout(() => {
        n.focus();
        n.name.selectionStart = node.selectionStart;
        n.name.selectionEnd = node.selectionEnd;
      }, 0);
    }
    for (let child of node.children) {
      n.appendChild(Node.deserialize(child), false);
    }
    return n;
  }

  focus() {
    if (this.parent) {
      this.parent.traverseUp((n) => n.expand());
    }
    this.name.focus();
  }

  replaceWith(node, focus = true) {
    node.parent = this.parent;
    this.elem.replaceWith(node.elem);
    if (focus) {
      node.focus();
    }
  }

  remove(focus = true) {
    if (focus) {
      if (this.elem.previousSibling && this.elem.previousSibling.node) {
        this.elem.previousSibling.node.focus();
      } else if (this.parent) {
        this.parent.focus();
      } else if (this.elem.nextSibling && this.elem.nextSibling.node) {
        this.elem.nextSibling.node.focus();
      } else {
        this.focus();
      }
    }
    if (this.parent) {
      this.elem.remove();
      return true;
    } else if (this.name.value != "" || this.children.children.length) {
      this.children.replaceChildren();
      this.name.value = "";
      return true;
    }
  }

  insertAfter(siblingNode, focus = true) {
    siblingNode.parent = this.parent;
    this.elem.after(siblingNode.elem);
    if (focus) {
      siblingNode.focus();
    }
  }

  appendChild(childNode, focus = true) {
    childNode.parent = this;
    this.children.appendChild(childNode.elem);
    if (focus) {
      childNode.focus();
    }
  }

  prependChild(childNode, focus = true) {
    childNode.parent = this;
    this.children.prepend(childNode.elem);
    if (focus) {
      childNode.focus();
    }
  }

  collapse() {
    this.children.classList.add("hidden");
    this.toggleButton.textContent = "▶";
  }

  expand() {
    this.children.classList.remove("hidden");
    this.toggleButton.textContent = "▼";
  }

  get collapsed() {
    return this.children.classList.contains("hidden");
  }

  get expanded() {
    return !this.collapsed;
  }

  toggle() {
    if (this.collapsed) {
      this.expand();
    } else {
      this.collapse();
    }
  }
}

function unescapeValue(str) {
  return str
    .replace(/\\=/g, "=")
    .replace(/\\:/g, ":")
    .replace(/\\\./g, ".")
    .replace(Node.listTypeRegEx, "")
    .replace(Node.nodeTypeRegEx, "");
}

function unescape(str) {
  return unescapeValue(str).replace(/^\\-/, "-");
}
