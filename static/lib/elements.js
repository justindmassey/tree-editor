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

function createElement(tag) {
  return function (...children) {
    let element = document.createElement(tag);
    for (let child of children) {
      if (child instanceof Element) {
        element.appendChild(child);
      } else if (child && child.elem && child.elem instanceof Element) {
        element.appendChild(child.elem);
      } else {
        element.appendChild(new Text(child));
      }
    }
    return element;
  };
}

export const a = createElement("a");
export const abbr = createElement("abbr");
export const address = createElement("address");
export const area = createElement("area");
export const article = createElement("article");
export const aside = createElement("aside");
export const audio = createElement("audio");
export const b = createElement("b");
export const base = createElement("base");
export const bdi = createElement("bdi");
export const bdo = createElement("bdo");
export const blockquote = createElement("blockquote");
export const body = createElement("body");
export const br = createElement("br");
export const button = createElement("button");
export const canvas = createElement("canvas");
export const caption = createElement("caption");
export const cite = createElement("cite");
export const code = createElement("code");
export const col = createElement("col");
export const colgroup = createElement("colgroup");
export const data = createElement("data");
export const datalist = createElement("datalist");
export const dd = createElement("dd");
export const del = createElement("del");
export const details = createElement("details");
export const dfn = createElement("dfn");
export const dialog = createElement("dialog");
export const div = createElement("div");
export const dl = createElement("dl");
export const dt = createElement("dt");
export const em = createElement("em");
export const embed = createElement("embed");
export const fieldset = createElement("fieldset");
export const figcaption = createElement("figcaption");
export const figure = createElement("figure");
export const footer = createElement("footer");
export const form = createElement("form");
export const h1 = createElement("h1");
export const h2 = createElement("h2");
export const h3 = createElement("h3");
export const h4 = createElement("h4");
export const h5 = createElement("h5");
export const h6 = createElement("h6");
export const head = createElement("head");
export const header = createElement("header");
export const hr = createElement("hr");
export const html = createElement("html");
export const i = createElement("i");
export const iframe = createElement("iframe");
export const img = createElement("img");
export const input = createElement("input");
export const ins = createElement("ins");
export const kbd = createElement("kbd");
export const label = createElement("label");
export const legend = createElement("legend");
export const li = createElement("li");
export const link = createElement("link");
export const main = createElement("main");
export const map = createElement("map");
export const mark = createElement("mark");
export const math = createElement("math");
export const menu = createElement("menu");
export const meta = createElement("meta");
export const meter = createElement("meter");
export const nav = createElement("nav");
export const noscript = createElement("noscript");
export const object = createElement("object");
export const ol = createElement("ol");
export const optgroup = createElement("optgroup");
export const option = createElement("option");
export const output = createElement("output");
export const p = createElement("p");
export const param = createElement("param");
export const picture = createElement("picture");
export const portal = createElement("portal");
export const pre = createElement("pre");
export const progress = createElement("progress");
export const q = createElement("q");
export const rb = createElement("rb");
export const rp = createElement("rp");
export const rt = createElement("rt");
export const rtc = createElement("rtc");
export const ruby = createElement("ruby");
export const s = createElement("s");
export const samp = createElement("samp");
export const script = createElement("script");
export const section = createElement("section");
export const select = createElement("select");
export const slot = createElement("slot");
export const small = createElement("small");
export const source = createElement("source");
export const span = createElement("span");
export const strong = createElement("strong");
export const style = createElement("style");
export const sub = createElement("sub");
export const summary = createElement("summary");
export const sup = createElement("sup");
export const svg = createElement("svg");
export const table = createElement("table");
export const tbody = createElement("tbody");
export const td = createElement("td");
export const template = createElement("template");
export const textarea = createElement("textarea");
export const tfoot = createElement("tfoot");
export const th = createElement("th");
export const thead = createElement("thead");
export const time = createElement("time");
export const title = createElement("title");
export const tr = createElement("tr");
export const track = createElement("track");
export const u = createElement("u");
export const ul = createElement("ul");
export const var_ = createElement("var");
export const video = createElement("video");
export const wbr = createElement("wbr");
