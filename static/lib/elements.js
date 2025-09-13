Element.prototype.e = function (event, callback) {
  this.addEventListener(event, callback);
  return this;
};

Element.prototype.c = function (...classes) {
  this.classList.add(...classes);
  return this;
};

Element.prototype.a = function (key, value) {
  this.setAttribute(key, value);
  return this;
};

function element(tag, ...children) {
  let element = document.createElement(tag);
  for (let child of children) {
    if (child instanceof Element) {
      element.appendChild(child);
    } else if (child.elem && child.elem instanceof Element) {
      element.appendChild(child.elem);
    } else {
      element.appendChild(new Text(String(child)));
    }
  }
  return element;
}

function createElement(tag) {
  return function (...children) {
    return element(tag, ...children);
  };
}

export const a = createElement("a");
export const article = createElement("article");
export const aside = createElement("aside");
export const audio = createElement("audio");
export const b = createElement("b");
export const blockquote = createElement("blockquote");
export const br = createElement("br");
export const button = createElement("button");
export const canvas = createElement("canvas");
export const code = createElement("code");
export const div = createElement("div");
export const em = createElement("em");
export const footer = createElement("footer");
export const form = createElement("form");
export const h1 = createElement("h1");
export const h2 = createElement("h2");
export const header = createElement("header");
export const hr = createElement("hr");
export const i = createElement("i");
export const iframe = createElement("iframe");
export const img = createElement("img");
export const input = createElement("input");
export const label = createElement("label");
export const li = createElement("li");
export const main = createElement("main");
export const nav = createElement("nav");
export const ol = createElement("ol");
export const option = createElement("option");
export const p = createElement("p");
export const path = createElement("path");
export const pre = createElement("pre");
export const section = createElement("section");
export const select = createElement("select");
export const span = createElement("span");
export const strong = createElement("strong");
export const svg = createElement("svg");
export const table = createElement("table");
export const td = createElement("td");
export const textarea = createElement("textarea");
export const tr = createElement("tr");
export const ul = createElement("ul");
export const video = createElement("video");
