import registerShortcuts from "./lib/register-shortcuts.js";
import nodeCommands from "./node-commands.js";
import { div, input, ol, li } from "./lib/elements.js";
import widgets from "./widgets.js";
import history from "./history.js";

export default class Node {
  static attrRegEx = /^([^=]*)(?<!\\)=(.*)$/;

  constructor(name = "", ...children) {
    this.toggleButton = div()
      .c("button", "toggle-button")
      .e("click", () => this.toggle());
    this.name = input()
      .c("name")
      .a("size", 30)
      .e("input", () => history.add());
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
      this.children
    ).c("node");
    this.elem.node = this;
    for (let child of children) {
      this.appendChild(child, false);
    }
    this.expand();
  }

  setAttribute(name, value = "", focus = false) {
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
    this.prependChild(attr, focus);
  }

  get attributes() {
    let atts = {};
    for (let child of this.children.children) {
      let m = child.node.isAttribute;
      if (m) {
        atts[m[1]] = m[2].replace(/\\=/g, "=");
      }
    }
    this._atts = atts;
    return atts;
  }

  get isAttribute() {
    return this.name.value.match(Node.attrRegEx);
  }

  toElement() {
    let m = this.name.value.match(/^(:\S+)\s*(.*)/);
    if (m && widgets[m[1]]) {
      return widgets[m[1]].create(this, m[2].replace(/\\=/g, "="));
    } else {
      let children = ol();
      for (let child of this.children.children) {
        if (!child.node.isAttribute) {
          children.appendChild(li(child.node.toElement()));
        }
      }
      let name = this.name.value.replace(/\\=/g, "=") || " ";
      if (children.children.length) {
        return div(div(name), children);
      } else {
        return div(name);
      }
    }
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
      return;
    } else if (includeCollapsed || this.expanded) {
      for (let child of this.children.children) {
        child.node.traverse(callback, includeCollapsed);
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
