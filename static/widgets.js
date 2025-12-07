import {
  div,
  h1,
  a,
  input,
  code,
  table,
  tr,
  td,
  thead,
  tbody,
  textarea,
  select,
  option,
  ul,
  ol,
  li,
  fieldset,
  legend,
  span,
  p,
  h3,
  h4,
} from "./lib/elements.js";
import history from "./history.js";
import Tabs from "./lib/tabs.js";
import Node from "./node.js";
import ctrlClick from "./ctrl-click.js";

export default {
  "-ul": {
    description: div(div("unordered list"), div("this is the default widget")),
    create(arg) {
      let children = ul();
      for (let child of this.childNodes) {
        children.appendChild(li(child.toWidget()));
      }
      if (children.children.length) {
        return div(div(arg), children);
      } else {
        return div(arg);
      }
    },
  },
  "-ol": {
    description: div(div("ordered list")),
    create(arg) {
      let children = ol();
      for (let child of this.childNodes) {
        children.appendChild(li(child.toWidget()));
      }
      if (children.children.length) {
        return div(div(arg), children);
      } else {
        return div(arg);
      }
    },
  },
  "-hl": {
    description: div(div("horizontal list")),
    create(arg) {
      let list = span();
      let lastComma;
      for (let child of this.childNodes) {
        list.appendChild(
          span(child.nameText).e("click", (ev) => ctrlClick(child, ev))
        );
        lastComma = span(", ");
        list.appendChild(lastComma);
      }
      if (lastComma) {
        lastComma.remove();
      }

      if (arg) {
        let label = span(arg);
        if (this._childNodes.length) {
          label.appendChild(span(": "));
        }
        return div(label, list);
      } else {
        return div(list);
      }
    },
  },
  "-hdr": {
    description: div(
      div("large header with the children below"),
      div(code("argument"), ": the header text")
    ),
    create(arg) {
      let children = div();
      for (let child of this.childNodes) {
        children.appendChild(child.toWidget());
      }
      return div(h1(arg), children).c("hdr");
    },
  },
  "-lnk": {
    description: div(
      div("a hyperlink"),
      div(code("argument"), ": the link text"),
      div(code("url"), ": The URL the link opens")
    ),
    create(arg) {
      let link = a(arg).a("target", "_blank");
      if ("url" in this.attributes) {
        link.href = this._attributes.url;
      } else {
        this.setAttribute("url");
      }
      return div(link);
    },
  },
  "-cl": {
    description: div(
      div("turns each child into a checklist item"),
      div("items have the attribute ", code("checked"))
    ),
    create(arg) {
      let checklist = div();
      for (let child of this.childNodes) {
        let checkbox = input()
          .a("type", "checkbox")
          .e("change", () => {
            child.setAttribute("checked", checkbox.checked);
            history.add(true);
          });
        if ("checked" in child.attributes) {
          checkbox.checked = child._attributes.checked == "true";
        } else {
          child.setAttribute("checked", "false");
        }
        checklist.appendChild(
          div(checkbox, div(child.toWidget()).c("cl-child"))
            .c("cl-item")
            .e("click", (ev) => ctrlClick(child, ev))
        );
      }
      if (arg) {
        return div(div(arg), checklist);
      } else {
        return checklist;
      }
    },
  },
  "-tbl": {
    description: div(
      div("a table"),
      div("each childs name is a table header and its children the column")
    ),
    create(arg) {
      let header = tr();
      let bdy = tbody();
      let longestChild = 0;

      for (let child of this.childNodes) {
        header.appendChild(
          td(child.nameText).e("click", (ev) => ctrlClick(child, ev))
        );
        if (child.childNodes.length > longestChild) {
          longestChild = child._childNodes.length;
        }
      }
      for (let i = 0; i < longestChild; i++) {
        let row = tr();
        for (let child of this._childNodes) {
          let cell = child.childNodes[i];
          if (cell) {
            row.appendChild(td(cell.toWidget()));
          } else {
            row.appendChild(td());
          }
        }
        bdy.appendChild(row);
      }
      let tbl = table(thead(header), bdy);
      if (arg) {
        return div(div(arg), tbl).c("tbl");
      } else {
        return tbl.c("tbl");
      }
    },
  },
  "-tbs": {
    description: div(
      div("a tab panel"),
      div(
        "each child name becomes a tab name and its children the tab content"
      ),
      div(code("tab"), " holds the current tab")
    ),
    create(arg) {
      let tabs = {};
      let tabClicked = {};
      for (let child of this.childNodes) {
        tabs[child.nameText] = div();
        tabClicked[child._nameText] = (ev) => ctrlClick(child, ev);
        for (let grandchild of child.childNodes) {
          tabs[child._nameText].appendChild(grandchild.toWidget());
        }
      }
      let tabsObj = new Tabs(
        tabs,
        (tab) => {
          this.setAttribute("tab", tab);
          history.add(true);
        },
        tabClicked
      );
      if ("tab" in this.attributes && tabs[this._attributes.tab]) {
        tabsObj.tab = this._attributes.tab;
      } else {
        this.setAttribute("tab", tabsObj.tab);
      }
      if (arg) {
        return div(div(arg), tabsObj.elem);
      } else {
        return tabsObj.elem;
      }
    },
  },
  "-ta": {
    description: div(div("a textarea"), div("children become lines of text")),
    create(arg) {
      let ta = textarea()
        .a("rows", 8)
        .a("cols", 40)
        .e("input", () => {
          this.children.replaceChildren();
          for (let line of ta.value.split("\n")) {
            this.appendChild(new Node(line), false);
          }
          history.add(true);
        });
      let lines = [];
      for (let child of this.children.children) {
        lines.push(child.node.name.value);
      }
      ta.value = lines.join("\n");
      if (arg) {
        return div(div(arg), ta);
      } else {
        return ta;
      }
    },
  },
  "-opt": {
    description: div(
      div("option"),
      div(code("value"), ": the selected option"),
      div("children become optinons")
    ),
    create(arg) {
      let opt = select().e("change", () => {
        this.setAttribute("value", opt.value);
        history.add(true);
      });
      for (let child of this.childNodes) {
        opt.appendChild(option(child.nameText));
      }
      if ("value" in this.attributes) {
        opt.value = this._attributes.value;
      } else {
        this.setAttribute("value", opt.value);
      }
      if (arg) {
        return div(arg, " ", opt);
      } else {
        return opt;
      }
    },
  },
  "-frm": {
    description: div(
      div("form"),
      div("attributes become form fields"),
      div("non-attribute children are rendered below")
    ),
    create(arg) {
      let form = table().c("frm-form");
      let children = div();
      for (let attrNode of this.attrNodes) {
        let entry = input().e("input", () => {
          attrNode.name.value = attrNode._isAttribute[1] + "=" + entry.value;
          history.add(true);
        });
        entry.value = attrNode._isAttribute[2];
        form.appendChild(
          tr(td(attrNode.attrNameText), td(entry)).e("click", (ev) =>
            ctrlClick(attrNode, ev)
          )
        );
      }
      for (let child of this.childNodes) {
        children.appendChild(child.toWidget());
      }
      if (arg) {
        return fieldset(legend(arg), form, children).c("frm");
      } else {
        return div(form, children).c("frm");
      }
    },
  },
  "-par": {
    description: div(
      div("paragraphs"),
      div(code("argument"), ": a header"),
      div("each child becomes a header"),
      div("grandchildren become paragraphs")
    ),
    create(arg) {
      let paragraphs = div();
      for (let child of this.childNodes) {
        paragraphs.appendChild(
          h4(child.nameText).e("click", (ev) => ctrlClick(child, ev))
        );
        let paragraph = p();
        for (let grandchild of child.childNodes) {
          paragraph.appendChild(grandchild.toWidget());
        }
        paragraphs.appendChild(paragraph);
      }
      if (arg) {
        return div(h3(arg), paragraphs);
      } else {
        return paragraphs;
      }
    },
  },
};
