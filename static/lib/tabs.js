import { div } from "./elements.js";

export default class Tabs {
  constructor(tabs, initialTab, onchange) {
    this.initialTab = initialTab;
    this.onchange = onchange;
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
    let tabNames = Array.from(tabs.keys());
    if (tabNames.length) {
      for (let name of tabNames) {
        this.headers[name] = div(name).c("tab");
        if (tabs.get(name).node) {
          this.headers[name].ctrlClick(tabs.get(name).node);
        }
        this.headers[name].e("click", (ev) => {
          if (this.tab != name) {
            this.tab = name;
            if (this.onchange) {
              this.onchange(name);
            }
          }
        });
        this.header.appendChild(this.headers[name]);
        tabs.get(name).classList.add("hidden");
        this.body.appendChild(tabs.get(name));
      }
      this._tab = this.initialTab;
      this.tab = this._tab;
    }
  }

  get tabs() {
    return this._tabs;
  }

  set tab(name) {
    if (this.tabs.get(name)) {
      this.tabs.get(this.tab).classList.add("hidden");
      this.headers[this.tab].classList.remove("active");
      this._tab = name;
      this.tabs.get(this.tab).classList.remove("hidden");
      this.headers[this.tab].classList.add("active");
    }
  }

  get tab() {
    return this._tab;
  }
}
