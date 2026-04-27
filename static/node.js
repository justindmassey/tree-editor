import registerShortcuts from "./lib/register-shortcuts.js";
import nodeCommands from "./node-commands.js";
import { div, input } from "./lib/elements.js";
import widgets from "./widgets.js";
import history from "./history.js";
import moveElementToIndex from "./lib/move-element-to-index.js";
import tree from "./tree.js";

Element.prototype.ctrlClick = function (node) {
  this.e("mousedown", (ev) => {
    if (ev.ctrlKey) {
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      ev.preventDefault();
      node.focus();
    }
  });
  this.e("click", (ev) => {
    if (ev.ctrlKey) {
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      ev.preventDefault();
      node.focus();
    }
  });
  return this;
};

export default class Node {
  static attrRegEx = /^((?:[^=]|(?:(?<!\\)\\=))*)(?<!(?<!\\)\\)=(.*)$/;
  static widgetRegEx = /^(-\S+)\s*(.*)/;
  static nodeTypeRegEx = /(?<!(?<!\\)\\)\.[^\.:\s]+/g;
  static listTypeRegEx = /(?<!:|((?<!\\)\\)):[^\.:\s]+/g;
  static typedefRegEx = /^::([^:\.]+)/;

  constructor(name = "", ...children) {
    this.toggleButton = div("▼")
      .c("button", "toggle-button")
      .e("click", () => this.toggle());
    this.name = input()
      .c("name")
      .e("input", () => {
        history.add();
        this.updateLastValues();
      })
      .e("focus", () => this.updateLastValues());
    registerShortcuts(this.name, nodeCommands, this);
    this.name.value = name;
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
      this.children,
    ).c("node");
    this.elem.node = this;
    for (let child of children) {
      this.appendChild(child, false);
    }
    this.updateLastValues();
  }

  get widget() {
    let m = this.name.value.match(Node.widgetRegEx);
    if (m && widgets[m[1]]) {
      return widgets[m[1]].create
        .bind(this)(this.attributeSubstitution(unescapeArg(m[2])), m[2])
        .ctrlClick(this);
    } else {
      let arg = this.attributeSubstitution(unescape(this.name.value));
      if (arg) {
        if (this.childrenWidget.children.length) {
          return div(div(arg), this._childrenWidget.c("indented")).ctrlClick(
            this,
          );
        } else {
          return div(arg).ctrlClick(this);
        }
      } else {
        return this.childrenWidget.ctrlClick(this);
      }
    }
  }

  get childrenWidget() {
    this._childrenWidget = div();
    for (let child of this.childNodes) {
      this._childrenWidget.appendChild(child.widget);
    }
    return this._childrenWidget;
  }

  getPath(upTo) {
    let result = [];
    let curNode = this;
    while (curNode && curNode != upTo) {
      if (curNode.isAttribute) {
        result.unshift({
          name:
            unescapeAttrName(curNode._isAttribute[1]) +
            "=" +
            this.attributeSubstitution(curNode._isAttribute[2]),
          node: curNode,
        });
      } else {
        result.unshift({
          name: curNode.nameText,
          node: curNode,
        });
      }
      curNode = curNode.parent;
    }
    return result;
  }

  merge(node, typeName) {
    let activeElement = document.activeElement;
    let n = node.copy();

    if (typeName) {
      for (let child of [...this.children.children]) {
        if (
          child.node.sourceOwner == typeName &&
          child.node.sourceType &&
          child.node.equals(child.node.sourceType) &&
          !node.getChild(child.node.name.value)
        ) {
          if (
            !child.node.isAttribute ||
            !node.getAttrNode(child.node._isAttribute[1])
          ) {
            child.node.remove(false);
          }
        }
      }
    }
    let children = Array.from(n.children.children);
    let uniqueChildren = [];
    let found = Object.create(null);
    let foundAtts = Object.create(null);
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      if (child.node.isAttribute) {
        if (child.node._isAttribute[1] in foundAtts) {
          continue;
        }
        foundAtts[child.node._isAttribute[1]] = true;
      } else {
        if (child.node.name.value in found) {
          continue;
        }
        found[child.node.name.value] = true;
      }
      uniqueChildren.push(child);
      let prevNode;
      let attrNameSame =
        child.node.isAttribute &&
        child.node._isAttribute[1] == child.node.lastAttrName;
      let hasLastAttr = node.getAttrNode(child.node.lastAttrName);
      if (
        typeName &&
        child.node.lastName != child.node.name.value &&
        !node.getChild(child.node.lastName) &&
        (!hasLastAttr || attrNameSame)
      ) {
        prevNode = this.getChild(child.node.lastName);
        if (prevNode && prevNode.sourceOwner == typeName) {
          prevNode.name.value = child.node.name.value;
          prevNode.updateLastValues();
        }
      }
      let m = child.node._isAttribute;
      if (m) {
        if (typeName && m[1] != child.node.lastAttrName && !hasLastAttr) {
          let lastAttrNode = this.getAttrNode(child.node.lastAttrName);
          if (lastAttrNode && lastAttrNode.sourceOwner == typeName) {
            lastAttrNode.remove(false);
            this.setAttribute(m[1], lastAttrNode.isAttribute[2], false, false);
          }
        }
        if (!this.getAttrNode(m[1])) {
          this.setAttribute(m[1], m[2], false, false);
        }
        console.log(m[1])
        let attrNode = this.getAttrNode(m[1]);
        if (typeName) {
          attrNode.sourceType = child.node.copy();
          attrNode.sourceOwner = typeName;
        }

        if (document.activeElement != attrNode.name) {
          attrNode.lastName = child.node.lastName;
          attrNode.lastAttrName = child.node.lastAttrName;
        }
        moveElementToIndex(attrNode.elem, uniqueChildren.length - 1);
      } else {
        let existing = this.getChild(child.node.name.value);
        if (!existing) {
          if (typeName) {
            child.node.sourceType = child.node.copy();
            child.node.sourceOwner = typeName;
          }
          if (prevNode) {
            child.node.merge(prevNode, false);
          }
          this.appendChild(child.node, false);
        } else if (typeName) {
          existing.sourceType = child.node.copy();
          existing.sourceOwner = typeName;
        }
        let mergedChild = this.getChild(child.node.name.value);
        if (document.activeElement != mergedChild.name) {
          mergedChild.lastName = child.node.lastName;
        }
        moveElementToIndex(mergedChild.elem, uniqueChildren.length - 1);
      }
    }
    let foundChildren = Object.create(null);
    let uniqueAtts = Object.create(null);
    for (let child1 of this.children.children) {
      if (child1.node.isAttribute) {
        if (child1.node._isAttribute[1] in uniqueAtts) {
          continue;
        }
        uniqueAtts[child1.node._isAttribute[1]] = true;
      } else {
        if (child1.node.name.value in foundChildren) {
          continue;
        }
        foundChildren[child1.node.name.value] = true;
      }
      for (let child2 of uniqueChildren) {
        let attributesMatch =
          child1.node._isAttribute &&
          child2.node._isAttribute &&
          child1.node._isAttribute[1] == child2.node._isAttribute[1];
        if (
          child1.node.name.value == child2.node.name.value ||
          attributesMatch
        ) {
          child1.node.merge(child2.node, typeName);
        }
      }
    }
    activeElement.focus();
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

  traverseChildNodes(callback, includeCollapsed = true) {
    if (callback(this)) {
      return true;
    } else if (includeCollapsed || this.expanded) {
      for (let child of this.childNodes) {
        if (child.traverseChildNodes(callback, includeCollapsed)) {
          return true;
        }
      }
    }
  }

  setAttribute(unescapedName, value = "", focus = false, escape = true) {
    let name = unescapedName;
    if (escape) {
      name = unescapedName.replace(/\\/g, "\\\\").replace(/=/g, "\\=");
    }
    for (let i = this.children.children.length - 1; i >= 0; i--) {
      let child = this.children.children[i];
      if (child.node.name.value.startsWith(name + "=")) {
        child.node.name.value = name + "=" + value;
        if (this._attributes) {
          this._attributes[unescapedName] = value;
        }
        if (this._attrNodeMap) {
          this._attrNodeMap[unescapedName] = child.node;
        }
        child.node.updateLastValues();
        if (focus) {
          child.node.focus();
        }
        return;
      }
    }
    let attr = new Node(name + "=" + value);
    this.prependChild(attr, focus);
    if (this._attributes) {
      this._attributes[unescapedName] = value;
    }
    if (this._attrNodeMap) {
      this._attrNodeMap[unescapedName] = attr;
    }
  }

  get attributes() {
    this._attributes = Object.create(null);
    this._attrNodeMap = Object.create(null);
    for (let child of this.children.children) {
      let m = child.node.isAttribute;
      if (m) {
        let name = unescapeAttrName(m[1]);
        this._attrNodeMap[name] = child.node;
        this._attributes[name] = this.attributeSubstitution(m[2]);
      }
    }
    return this._attributes;
  }

  get isAttribute() {
    this._isAttribute = this.name.value.match(Node.attrRegEx);
    return this._isAttribute;
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

  get attrNodes() {
    this._attrNodes = [];
    for (let child of this.children.children) {
      if (child.node.isAttribute && !child.node.name.value.startsWith("#")) {
        this._attrNodes.push(child.node);
      }
    }
    return this._attrNodes;
  }

  get nameText() {
    this._nameText = this.attributeSubstitution(unescape(this.name.value));
    return this._nameText;
  }

  get attrNameText() {
    if (this.isAttribute) {
      return unescapeAttrName(this._isAttribute[1]);
    }
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
    n.lastNameText = this.lastNameText;
    n.sourceType = this.sourceType;
    n.sourceOwner = this.sourceOwner;
    for (let child of this.children.children) {
      n.appendChild(child.node.copy());
    }
    return n;
  }

  equals(node) {
    if (this.name.value != node.name.value) {
      return false;
    }
    if (this.children.children.length != node.children.children.length) {
      return false;
    }
    for (let i = 0; i < this.children.children.length; i++) {
      if (
        !this.children.children[i].node.equals(node.children.children[i].node)
      ) {
        return false;
      }
    }
    return true;
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
    tree.activeElement = this.name;
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
      this.updateLastValues();
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

  attributeSubstitution(str, depth = 0) {
    if (!str.includes(";")) {
      return str;
    }
    let result = str;
    let attributes = Object.create(null);
    let curNode = this.parent;
    while (curNode) {
      for (let i = curNode.attrNodes.length - 1; i >= 0; i--) {
        let attrNode = curNode._attrNodes[i];
        if (!(attrNode._isAttribute[1] in attributes)) {
          attributes[attrNode._isAttribute[1]] = attrNode._isAttribute[2];
        }
      }
      curNode = curNode.parent;
    }
    for (let attr in attributes) {
      result = result.replaceAll(";" + attr + ";", attributes[attr]);
    }
    if (result != str && depth < 100) {
      return this.attributeSubstitution(result, depth + 1);
    } else {
      return result;
    }
  }
}

function unescape(str) {
  return unescapeArg(
    str
      .replace(/^-\S+\s*/, "")
      .replace(/^(?<!\\)\\-/, "-")
      .replace(/^(?<!\\)\\#/, "#")
      .replace(/^(?<!\\)\\::/, "::"),
  );
}

function unescapeAttrName(str) {
  return str.replaceAll(/(?<!\\)\\=/g, "=").replace(/\\\\/g, "\\");
}

function unescapeArg(str) {
  return str
    .replace(Node.listTypeRegEx, "")
    .replace(Node.nodeTypeRegEx, "")
    .replace(/\\:(?!:)/g, ":")
    .replace(/\\\./g, ".")
    .replace(/\\=/g, "=")
    .replace(/\\\\/g, "\\");
}
