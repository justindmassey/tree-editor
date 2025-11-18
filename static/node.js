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
  static typedefRegEx = /^::([^:\.]+)/;

  constructor(name = "", ...children) {
    this.toggleButton = div()
      .c("button", "toggle-button")
      .e("click", () => this.toggle());
    this.name = input()
      .c("name")
      .a("size", 40)
      .e("input", () => {
        history.add();
        this.updateLastValues();
      });
    registerShortcuts(this.name, nodeCommands, this);
    this.name.value = name;
    this.updateLastValues();
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

  updateLastValues() {
    this.lastName = this.name.value;
    let m = this.isAttribute;
    if (m) {
      this.lastAttrName = m[1];
    } else {
      this.lastAttrName = null;
    }
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
      let prevNode;
      if (removeLastName && child.node.lastName != child.node.name.value) {
        prevNode = this.getChild(child.node.lastName);
        if (prevNode) {
          prevNode.remove(false);
        }
      }
      let m = child.node.isAttribute;
      if (m) {
        if (removeLastName && m[1] != child.node.lastAttrName) {
          let lastAttrNode = this.getAttrNode(child.node.lastAttrName);
          if (lastAttrNode) {
            lastAttrNode.remove(false);
            this.setAttribute(m[1], lastAttrNode.isAttribute[2], false, false);
          }
        }
        if (!(unescape(m[1]) in this.attributes)) {
          this.setAttribute(m[1], m[2], false, false);
        }
        let attrNode = this.getAttrNode(m[1]);
        if (document.activeElement != attrNode.name) {
          attrNode.lastName = child.node.lastName;
          attrNode.lastAttrName = child.node.lastAttrName;
        }
        moveElementToIndex(attrNode.elem, i);
      } else {
        if (!this.getChild(child.node.name.value)) {
          if (prevNode) {
            child.node.merge(prevNode, false);
          }
          this.appendChild(child.node, false);
        }
        let mergedChild = this.getChild(child.node.name.value);
        if (document.activeElement != mergedChild.name) {
          mergedChild.lastName = child.node.lastName;
        }
        moveElementToIndex(mergedChild.elem, i);
      }
    }
    for (let child1 of this.children.children) {
      for (let child2 of n.children.children) {
        if (child1.node.name.value == child2.node.name.value) {
          child1.node.merge(child2.node);
        }
      }
    }
    activeElement.focus();
  }

  setAttribute(name, value = "", focus = false, escape = true) {
    if (escape) {
      name = name
        .replace(/=/g, "\\=")
        .replace(/^-/, "\\-")
        .replace(/^#/, "\\#");
    }
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

  _toElement() {
    let m = this.name.value.match(Node.widgetRegEx);
    if (m && widgets[m[1]]) {
      return widgets[m[1]].create(this, unescapeValue(m[2]));
    } else {
      let children = ol();
      for (let child of this.childNodes) {
        children.appendChild(li(child.toElement()));
      }
      if (children.children.length) {
        return div(div(this.nameText), children);
      } else {
        return div(this.nameText);
      }
    }
  }

  toElement() {
    return this._toElement().e("click", (ev) => {
      if (ev.ctrlKey) {
        ev.preventDefault();
        ev.stopPropagation();
        this.focus();
      }
    });
  }

  get childNodes() {
    this._childNodes = [];
    for (let child of this.children.children) {
      if (
        !child.node.isAttribute &&
        !child.node.name.value.startsWith("#") &&
        !child.node.name.value.match(Node.typedefRegEx)
      ) {
        this._childNodes.push(child.node);
      }
    }
    return this._childNodes;
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
      return this.parent.traverseUp(callback);
    }
  }

  traverse(callback, includeCollapsed = true) {
    if (callback(this)) {
      return true;
    } else if (includeCollapsed || this.expanded) {
      for (let child of Array.from(this.children.children)) {
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
    .replace(Node.listTypeRegEx, "")
    .replace(Node.nodeTypeRegEx, "")
    .replace(/\\:/g, ":")
    .replace(/\\\./g, ".");
}

function unescape(str) {
  return unescapeValue(str).replace(/^\\-/, "-").replace(/^\\#/, "#");
}
