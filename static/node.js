import registerShortcuts from "./lib/register-shortcuts.js";
import nodeCommands from "./node-commands.js";
import { div, input } from "./lib/elements.js";
import widgets from "./widgets.js";
import { updateSelection } from "./widgets.js";
import history from "./history.js";
import moveElementToIndex from "./lib/move-element-to-index.js";
import tree from "./tree.js";
import importTree from "./importers/tree.js";
import exportToTree from "./exporters/tree.js";

Element.prototype.linkNode = function (node) {
  this.classList.add("out");
  node.outputs.push(this);
  this.e("mousedown", (ev) => {
    if (ev.ctrlKey) {
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      ev.preventDefault();
      node.focus(true);
    }
  });
  this.e("click", (ev) => {
    if (ev.ctrlKey) {
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      ev.preventDefault();
    }
  });
  return this;
};

Element.prototype.setBlk = function () {
  setBlkTop(this);
  setBlkBottom(this);
  return this;
};

export default class Node {
  static attrRegEx = /^((?:[^=]|(?:(?<!\\)\\=))*)(?<!(?<!\\)\\)=(.*)$/;
  static widgetRegEx = /^(-[^\s.:]+)\s*(.*)/;
  static nodeTypeRegEx = /(?<!(?<!\\)\\)\.[^.:]+/g;
  static listTypeRegEx = /(?<!(?:^:)|((?<!\\)\\)):[^.:]+/g;
  static typedefRegEx = /^::([^:\.]+)/;
  static minNameSize = 40;
  static maxNameSize = 80;
  static updateHistoryOnFocus = true;
  constructor(name = "", ...children) {
    this.toggleButton = div("▼")
      .c("button", "toggle-button")
      .a("title", "Collapse this node")
      .e("click", () => this.toggle());
    this.name = input()
      .c("name")
      .a("size", Node.minNameSize)
      .e("input", () => {
        history.add();
        this.updateLastValues();
        this.lastModified = new Date();
      })
      .e("focus", () => {
        this.updateLastValues();
        tree.activeNode = this;
        if (Node.updateHistoryOnFocus) {
          history.update();
        }
      })
      .e("paste", (ev) => {
        let clipText = ev.clipboardData.getData("text/plain");
        if (clipText.includes("\n")) {
          ev.preventDefault();
          if (tree.pasteMode == "append") {
            for (let node of importTree(clipText, false)) {
              this.appendChild(node, false);
            }
            history.add();
          } else if (tree.pasteMode == "replace") {
            let imported = importTree(clipText, this.nameValue);
            if (!this.equals(imported)) {
              this.replaceWith(imported);
              history.add();
            }
          } else if (tree.pasteMode == "merge") {
            let textBefore = exportToTree(this);
            this.merge(importTree(clipText));
            let textAfter = exportToTree(this);
            if (textBefore != textAfter) {
              history.add();
            }
          }
        }
      })
      .e("copy", (ev) => {
        if (this.name.selectionStart == this.name.selectionEnd) {
          ev.preventDefault();
          ev.clipboardData.setData("text/plain", exportToTree(this));
        }
      })
      .e("cut", (ev) => {
        if (this.name.selectionStart == this.name.selectionEnd) {
          ev.preventDefault();
          ev.clipboardData.setData("text/plain", exportToTree(this));
          if (this.remove()) {
            history.add();
          }
        }
      })
      .e("keydown", (ev) => {
        if (ev.ctrlKey && ev.altKey && ev.key.match(/^\d$/)) {
          ev.preventDefault();
          let upToLevel = Number(ev.key);
          this.traverse((node, level) => {
            if (level <= upToLevel) {
              node.expand();
            } else {
              node.collapse();
            }
          });
          history.update();
        }
      })
      .e("click", updateSelection.bind(this));
    registerShortcuts(this.name, nodeCommands, this);
    this.lastModified = new Date();
    this.removeButton = div("✕")
      .a("title", "Remove this node")
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
    this.nameValue = name;
    this.updateLastValues();
    this.elem.node = this;
    this.outputs = [];
    for (let child of children) {
      this.appendChild(child, false);
    }
  }

  get widget() {
    this.traverse((n) => {
      n.outputs = [];
    });
    let m = this.nameValue.match(Node.widgetRegEx);
    if (m && widgets[m[1]]) {
      this._widget = widgets[m[1]].create
        .bind(this)(this.attributeSubstitution(unescapeArg(m[2])), m[2])
        .linkNode(this);
    } else {
      let arg = this.attributeSubstitution(unescape(this.nameValue));
      this._widget = widgets["-txt"].create
        .bind(this)(arg, this.nameValue)
        .linkNode(this);
    }

    return this._widget.setBlk().c("widget");
  }

  get childrenWidget() {
    this._childrenWidget = div();
    for (let child of this.childNodes) {
      this._childrenWidget.appendChild(child.widget);
    }

    return this._childrenWidget.setBlk();
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
      for (let child of Array.from(this.children.children)) {
        if (
          child.node.sourceOwner == typeName &&
          child.node.sourceType &&
          child.node.equals(child.node.sourceType) &&
          !node.getChild(child.node.nameValue)
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
        if (child.node.nameValue in found) {
          continue;
        }
        found[child.node.nameValue] = true;
      }
      uniqueChildren.push(child);
      let prevNode;
      let attrNameSame =
        child.node.isAttribute &&
        child.node._isAttribute[1] == child.node.lastAttrName;
      let hasLastAttr = node.getAttrNode(child.node.lastAttrName);
      if (
        typeName &&
        child.node.lastName != child.node.nameValue &&
        !node.getChild(child.node.lastName) &&
        (!hasLastAttr || attrNameSame)
      ) {
        prevNode = this.getChild(child.node.lastName);
        if (prevNode && prevNode.sourceOwner == typeName) {
          prevNode.nameValue = child.node.nameValue;
        }
      }
      let m = child.node._isAttribute;
      if (m) {
        if (typeName && m[1] != child.node.lastAttrName && !hasLastAttr) {
          let lastAttrNode = this.getAttrNode(child.node.lastAttrName);
          if (lastAttrNode && lastAttrNode.sourceOwner == typeName) {
            lastAttrNode.remove(false);
            this.setAttribute(m[1], lastAttrNode.isAttribute[2], false);
          }
        }
        if (!this.getAttrNode(m[1])) {
          this.setAttribute(m[1], m[2], false);
        }
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
        let existing = this.getChild(child.node.nameValue);
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
        let mergedChild = this.getChild(child.node.nameValue);
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
        if (child1.node.nameValue in foundChildren) {
          continue;
        }
        foundChildren[child1.node.nameValue] = true;
      }
      for (let child2 of uniqueChildren) {
        let attributesMatch =
          child1.node._isAttribute &&
          child2.node._isAttribute &&
          child1.node._isAttribute[1] == child2.node._isAttribute[1];
        if (child1.node.nameValue == child2.node.nameValue || attributesMatch) {
          child1.node.merge(child2.node, typeName);
        }
      }
    }
    Node.updateHistoryOnFocus = false;
    activeElement.focus();
    Node.updateHistoryOnFocus = true;
  }

  traverseUp(callback) {
    if (callback(this)) {
      return;
    } else if (this.parent) {
      return this.parent.traverseUp(callback);
    }
  }

  traverse(callback, includeCollapsed = true, level = 1) {
    if (callback(this, level)) {
      return true;
    } else if (includeCollapsed || this.expanded) {
      for (let child of Array.from(this.children.children)) {
        if (child.node.traverse(callback, includeCollapsed, level + 1)) {
          return true;
        }
      }
    }
  }

  traverseChildNodes(callback, includeCollapsed = true, number = "") {
    let res = callback(this, number);
    if (res) {
      return res;
    } else if (includeCollapsed || this.expanded) {
      let num = 1;
      let numWidth = String(this.childNodes.length).length;
      for (let child of this._childNodes) {
        if (
          child.traverseChildNodes(
            callback,
            includeCollapsed,
            number + String(num).padStart(numWidth, " ") + ".",
          ) === true
        ) {
          return true;
        }
        num++;
      }
    }
  }

  setAttribute(name, value = "", focus = false, updateLastValues = true) {
    for (let i = this.children.children.length - 1; i >= 0; i--) {
      let child = this.children.children[i];
      if (child.node.nameValue.startsWith(name + "=")) {
        if (updateLastValues) {
          child.node.nameValue = name + "=" + value;
        } else {
          child.node._nameValue = name + "=" + value;
        }
        if (this._attributes) {
          this._attributes[name] = value;
        }
        if (this._attrNodeMap) {
          this._attrNodeMap[name] = child.node;
        }
        if (focus) {
          child.node.focus();
        }
        return;
      }
    }
    let attr = new Node(name + "=" + value);
    this.prependChild(attr, focus);
    if (this._attributes) {
      this._attributes[name] = value;
    }
    if (this._attrNodeMap) {
      this._attrNodeMap[name] = attr;
    }
  }

  updateAttribute(name, value) {
    if (this.attributes[name] != value) {
      this.setAttribute(name, value, false, false);
      history.add();
      this._attrNodeMap[name].updateLastValues();
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
    this._isAttribute = this.nameValue.match(Node.attrRegEx);
    return this._isAttribute;
  }

  get childNodes() {
    this._childNodes = [];
    for (let child of this.children.children) {
      if (child.node.nameValue.match(Node.typedefRegEx)) {
        child.node.widget;
      } else if (
        !child.node.isAttribute &&
        !child.node.nameValue.startsWith("#")
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
      if (child.node.isAttribute && !child.node.nameValue.startsWith("#")) {
        this._attrNodes.push(child.node);
      }
    }
    return this._attrNodes;
  }

  get nameText() {
    this._nameText = this.attributeSubstitution(unescape(this.nameValue));
    return this._nameText;
  }

  get attrNameText() {
    if (this.isAttribute) {
      return unescapeAttrName(this._isAttribute[1]);
    }
  }

  get nameValue() {
    return this.name.value;
  }

  set nameValue(newName) {
    if (String(newName) != this.nameValue) {
      this.lastModified = new Date();
      this.name.value = newName;
      this.updateLastValues();
    }
  }

  set _nameValue(newName) {
    if (String(newName) != this.nameValue) {
      this.lastModified = new Date();
      this.name.value = newName;
    }
  }

  updateLastValues() {
    this.lastName = this.nameValue;
    let m = this.isAttribute;
    this.elem.classList.remove("attribute");
    this.elem.classList.remove("special-attribute");
    this.name.classList.remove("non-attribute");
    if (m) {
      this.lastAttrName = m[1];
      if (m[1][0] == "$") {
        this.elem.classList.add("special-attribute");
      } else {
        this.elem.classList.add("attribute");
      }
    } else {
      this.name.classList.add("non-attribute");
      this.lastAttrName = null;
    }
  }

  copy() {
    let n = new Node(this.nameValue);
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
    if (this.nameValue != node.nameValue) {
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
      if (child.node.nameValue == name) {
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
      name: this.nameValue,
      lastModified: this.lastModified,
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
    n.lastModified = new Date(node.lastModified);
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

  get level() {
    let level = 1;
    let parent = this.parent;
    while (parent) {
      level++;
      parent = parent.parent;
    }
    return level;
  }

  focus(updateHistory = false) {
    if (!updateHistory) {
      Node.updateHistoryOnFocus = false;
    }
    if (this.parent) {
      this.parent.traverseUp((n) => n.expand());
    }
    this.name.focus();
    tree.activeNode = this;
    Node.updateHistoryOnFocus = true;
  }

  replaceWith(node, focus = true) {
    node.parent = this.parent;
    this.elem.replaceWith(node.elem);
    if (focus) {
      node.focus();
    }
  }

  remove(focus = true) {
    let toFocus;
    if (this.elem.nextSibling) {
      toFocus = this.elem.nextSibling.node;
    } else if (this.elem.previousSibling) {
      toFocus = this.elem.previousSibling.node;
    } else if (this.parent) {
      toFocus = this.parent;
    } else {
      toFocus = this;
    }
    if (focus) {
      toFocus.focus();
    }
    if (this.parent) {
      this.elem.remove();
      return toFocus || true;
    } else if (this.nameValue != "" || this.children.children.length) {
      this.children.replaceChildren();
      this.nameValue = "";
      return toFocus || true;
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
    this.toggleButton.title = "Expand this node";
  }

  expand() {
    this.children.classList.remove("hidden");
    this.toggleButton.textContent = "▼";
    this.toggleButton.title = "Collapse this node";
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
    history.update();
  }

  attributeSubstitution(str, depth = 0) {
    if (!str.includes(";")) {
      return str;
    }
    let result = str;
    let attributes = Object.create(null);
    let curNode = this;
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

  set lastModified(date) {
    this._lastModified = date;
    this.name.title =
      "Last edited: " +
      this.lastModified.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
  }

  get lastModified() {
    return this._lastModified;
  }
}

const unescapePrefixes = [
  {
    replace: /^-[^\s.:]+\s*/,
    with: "",
  },
  {
    replace: /^(?<!\\)\\-/,
    with: "-",
  },
  {
    replace: /^#/,
    with: "",
  },
  {
    replace: /^(?<!\\)\\#/,
    with: "#",
  },
  {
    replace: /^::/,
    with: "",
  },
  {
    replace: /^(?<!\\)\\::/,
    with: "::",
  },
];

function removePrefix(str) {
  for (let replacement of unescapePrefixes) {
    if (replacement.replace.test(str)) {
      return str.replace(replacement.replace, replacement.with);
    }
  }
  return str;
}

export function unescape(str) {
  return unescapeArg(removePrefix(str));
}

function unescapeAttrName(str) {
  return str
    .replaceAll(/(?<!\\)\\=/g, "=")
    .replace(/\\\\|\\/g, replaceBackslash);
}

function unescapeArg(str) {
  return str
    .replace(Node.listTypeRegEx, "")
    .replace(Node.nodeTypeRegEx, "")
    .replace(/\\:(?=[^:.])/g, ":")
    .replace(/\\\.(?=[^:.])/g, ".")
    .replace(/\\=/g, "=")
    .replace(/\\\\|\\/g, replaceBackslash);
}

function replaceBackslash(m) {
  if (m == "\\") {
    return "";
  } else {
    return "\\";
  }
}

function setBlkTop(elem) {
  if (elem.firstElementChild) {
    setBlkTop(elem.firstElementChild);
    if (
      elem.firstElementChild.classList.contains("blk-top") ||
      elem.firstElementChild.classList.contains("blk")
    ) {
      elem.classList.add("blk-top");
    }
  }
}

function setBlkBottom(elem) {
  if (elem.lastElementChild) {
    setBlkBottom(elem.lastElementChild);
    if (
      elem.lastElementChild.classList.contains("blk-bottom") ||
      elem.lastElementChild.classList.contains("blk")
    ) {
      elem.classList.add("blk-bottom");
    }
  }
}
