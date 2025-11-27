import { div } from "./elements.js";

export default class Tabs {
  constructor(tabs, onchange, tabClicked) {
    this.onchange = onchange;
    this.tabClicked = tabClicked;
    this.header = div().c("tabs-header");
    this.headers = {};
    this.body = div().c("tabs-body");
    this.elem = div(this.header, this.body).c("tabs");
    this.tabs = tabs;
  }

  set tabs(tabs) {
    this._tabs = tabs;
    this.header.replaceChildren();
    this.body.replaceChildren();
    let tabNames = Object.keys(tabs);
    if (tabNames.length) {
      for (let name in tabs) {
        this.headers[name] = div(name)
          .c("tab")
          .e("click", (ev) => {
            if (this.tab != name) {
              this.tab = name;
              if (this.onchange) {
                this.onchange(name);
              }
            }
            if (this.tabClicked) {
              this.tabClicked(ev);
            }
          });
        this.header.appendChild(this.headers[name]);
        tabs[name].classList.add("hidden");
        this.body.appendChild(tabs[name]);
      }
      this._tab = tabNames[0];
      this.tab = this._tab;
    }
  }

  get tabs() {
    return this._tabs;
  }

  set tab(name) {
    if (this.tabs[name]) {
      this.tabs[this.tab].classList.add("hidden");
      this.headers[this.tab].classList.remove("active");
      this._tab = name;
      this.tabs[this.tab].classList.remove("hidden");
      this.headers[this.tab].classList.add("active");
    }
  }

  get tab() {
    return this._tab;
  }
}
