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
  button,
  img,
} from "./lib/elements.js";
import history from "./history.js";
import Tabs from "./lib/tabs.js";
import Node from "./node.js";
import ctrlClick from "./ctrl-click.js";
import tree from "./tree.js";

export default {
  "-ul": {
    description: "unordered list",
    create(arg) {
      let children = ul();
      for (let child of this.childNodes) {
        children.appendChild(li(child.widget));
      }
      if (children.children.length) {
        if (arg) {
          return div(div(arg), children);
        } else {
          return children.c("ul");
        }
      } else {
        return div(arg);
      }
    },
  },
  "-ol": {
    description: "ordered list",
    create(arg) {
      let children = ol();
      for (let child of this.childNodes) {
        children.appendChild(li(child.widget));
      }
      if (children.children.length) {
        if (arg) {
          return div(div(arg), children);
        } else {
          return children.c("ol");
        }
      } else {
        return div(arg);
      }
    },
  },
  "-hl": {
    description: "horizontal list",
    create(arg) {
      let list = span().c("hl-list");
      let lastComma;
      for (let child of this.childNodes) {
        list.appendChild(child.widget);
        list.appendChild((lastComma = div(", ")));
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
      div(code("argument"), ": the header text"),
    ),
    create(arg) {
      return div(h1(arg), this.childrenWidget).c("hdr");
    },
  },
  "-par": {
    description: div(
      div("paragraphs"),
      div(code("argument"), ": a header"),
      div("Each child becomes a header."),
      div("Grandchildren become the paragraph."),
    ),
    create(arg) {
      let paragraphs = div();
      for (let child of this.childNodes) {
        paragraphs.appendChild(
          h4(child.nameText).e("click", (ev) => ctrlClick(child, ev)),
        );
        let paragraph = p();
        for (let grandchild of child.childNodes) {
          paragraph.appendChild(grandchild.widget);
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
  "-col": {
    description: div(div("columns"), div("renders children as columns")),
    create(arg) {
      if (arg) {
        return div(div(arg), this.childrenWidget.c("col", "indented"));
      } else {
        return this.childrenWidget.c("col");
      }
    },
  },
  "-tl": {
    description: div(
      div("tree link"),
      div("a link to another tree"),
      div(code("argument"), ": the name of the tree to link to"),
    ),
    create(arg) {
      return div(
        button(arg || " ").e("click", () => {
          tree.load(arg);
        }),
        this.childrenWidget.c("indented"),
      );
    },
  },
  "-lnk": {
    description: div(
      div("link"),
      div(code("argument"), ": the link text"),
      div(code("$url"), ": the URL the link opens"),
    ),
    create(arg) {
      let link = a(arg).a("target", "_blank");
      if ("$url" in this.attributes) {
        link.href = this._attributes.$url;
      } else {
        this.setAttribute("$url");
      }
      return div(link);
    },
  },
  "-cl": {
    description: div(
      div("checklist"),
      div("Turns each child into a checklist item."),
      div("Items have the attribute ", code("$checked"), "."),
    ),
    create(arg) {
      let checklist = div();
      for (let child of this.childNodes) {
        let checkbox = input()
          .a("type", "checkbox")
          .e("change", () => {
            child.setAttribute("$checked", checkbox.checked);
            history.add();
          });
        if ("$checked" in child.attributes) {
          checkbox.checked = child._attributes.$checked == "true";
        } else {
          child.setAttribute("$checked", checkbox.checked);
        }
        checklist.appendChild(
          div(checkbox, div(child.widget).c("cl-child"))
            .c("cl-item")
            .e("click", (ev) => ctrlClick(child, ev)),
        );
      }
      if (arg) {
        return div(div(arg), checklist.c("cl"));
      } else {
        return checklist;
      }
    },
  },
  "-tbl": {
    description: div(
      div("table"),
      div("Each child's name is a table header and its children the column."),
    ),
    create(arg) {
      let header = tr();
      let bdy = tbody();
      let longestChild = 0;

      for (let child of this.childNodes) {
        header.appendChild(
          td(child.nameText).e("click", (ev) => ctrlClick(child, ev)),
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
            row.appendChild(td(cell.widget));
          } else {
            row.appendChild(td());
          }
        }
        bdy.appendChild(row);
      }
      let tbl = table(thead(header), bdy);
      if (arg) {
        return div(div(arg), tbl.c("indented")).c("tbl");
      } else {
        return tbl.c("tbl");
      }
    },
  },
  "-htbl": {
    description: div(
      div("horizontal table"),
      div("children become row labels and their children the rows"),
    ),
    create(arg) {
      let tbl = table();
      let longestChild = 0;
      for (let child of this.childNodes) {
        let row = tr(
          td(
            div(child.nameText)
              .c("htbl-label")
              .e("click", (ev) => ctrlClick(child, ev)),
          ),
        );
        if (child.childNodes.length > longestChild) {
          longestChild = child._childNodes.length;
        }
        for (let grandchild of child.childNodes) {
          row.appendChild(td(grandchild.widget));
        }
        tbl.appendChild(row);
      }
      for (let row of tbl.children) {
        for (let i = row.children.length; i < longestChild + 1; i++) {
          row.appendChild(td());
        }
      }
      if (arg) {
        return div(div(arg), tbl.c("indented")).c("tbl");
      } else {
        return tbl.c("tbl");
      }
    },
  },
  "-crd": {
    description: div(
      div("card"),
      div(code("argument"), ": card header"),
      div("children become the card body"),
      div("attributes become a table at the bottom of the card"),
    ),
    create(arg) {
      let attrTable = table().c("crd-attr-table");
      for (let attr of this.attrNodes) {
        attrTable.appendChild(
          tr(
            td(attr.attrNameText),
            td(attr.attributeSubstitution(attr._isAttribute[2])),
          ).e("click", (ev) => ctrlClick(attr, ev)),
        );
      }
      let crd = div().c("crd");
      let crdHeader;
      if (arg) {
        crdHeader = div(arg).c("crd-header");
        crd.appendChild(crdHeader);
      }
      let crdBody = div(this.childrenWidget).c("crd-body");
      if (crdBody.firstChild.children.length) {
        crd.appendChild(crdBody);
        if (crdHeader) {
          crdHeader.c("border");
        }
      }
      if (!crdHeader && !crdBody.firstChild.children.length) {
        attrTable.c("no-border");
      }
      if (attrTable.children.length) {
        crd.appendChild(attrTable);
      }
      return crd;
    },
  },
  "-pts": {
    description: div(
      div("paths"),
      div(
        "renders the path (seperated by ",
        code("$sep"),
        ") of each leaf node",
      ),
      div(
        "If ",
        code("$sep"),
        " is not set the seperator defaults to a space.",
      ),
    ),
    create(arg) {
      let separator;
      if ("$sep" in this.attributes) {
        separator = this._attributes.$sep;
      } else {
        separator = " ";
      }
      let paths = [];
      for (let child of this.children.children) {
        if (child.node.isAttribute && child.node._isAttribute[1] == "$sep") {
          continue;
        }
        child.node.traverse((node) => {
          if (!node.children.children.length) {
            paths.push(node.getPath(this));
          }
        });
      }
      let pathsDiv = div();
      for (let path of paths) {
        pathsDiv.appendChild(div(path.join(separator)));
      }
      if (arg) {
        return div(div(arg), pathsDiv.c("indented"));
      } else {
        return pathsDiv;
      }
    },
  },
  "-tbs": {
    description: div(
      div("tabs"),
      div("Each child name becomes a tab."),
      div(code("$tab"), " holds the current tab"),
    ),
    create(arg) {
      let tabs = {};
      let tabClicked = {};
      for (let child of this.childNodes) {
        tabs[child.nameText] = child.childrenWidget;
        tabClicked[child._nameText] = (ev) => ctrlClick(child, ev);
      }
      let tabsObj = new Tabs(
        tabs,
        (tab) => {
          this.setAttribute("$tab", tab);
          history.add();
        },
        tabClicked,
      );
      if ("$tab" in this.attributes && tabs[this._attributes.$tab]) {
        tabsObj.tab = this._attributes.$tab;
      } else {
        this.setAttribute("$tab", tabsObj.tab);
      }
      if (arg) {
        return div(div(arg), tabsObj.elem.c("indented"));
      } else {
        return tabsObj.elem;
      }
    },
  },
  "-pgs": {
    description: div(
      div("pages"),
      div("Each child becomes a page."),
      div(code("$page"), " holds the current page number."),
    ),
    create(arg) {
      if (!("$page" in this.attributes)) {
        this.setAttribute("$page", 1);
      }
      this.childrenWidget;
      let page;
      if (this.childNodes[this._attributes.$page - 1]) {
        page = this._childNodes[this._attributes.$page - 1].widget;
      } else {
        page = "";
      }
      let pager = div(
        button("<").e("click", () => {
          let page = Number(this._attributes.$page);
          if (isNaN(page)) {
            this.setAttribute("$page", 1);
          } else {
            if (page <= 1 || page > this.childNodes.length) {
              this.setAttribute("$page", this._childNodes.length || 1);
            } else {
              this.setAttribute("$page", page - 1);
            }
          }
          history.add();
        }),
        div(this.attributes.$page + " / " + this.childNodes.length).c(
          "pgs-page",
        ),
        button(">").e("click", () => {
          let page = Number(this._attributes.$page);
          if (isNaN(page)) {
            this.setAttribute("$page", 1);
          } else {
            if (page < 1 || page >= this._childNodes.length) {
              this.setAttribute("$page", 1);
            } else {
              this.setAttribute("$page", page + 1);
            }
          }
          history.add();
        }),
      ).c("pgs-pager");
      if (arg) {
        return div(arg, " ", pager, div(page).c("indented"));
      } else {
        return div(pager, div(page));
      }
    },
  },
  "-img": {
    description: div(
      div("image"),
      div(code("argument"), ": image caption"),
      div(code("$url"), ": the url of the image"),
      div(code("$width"), ": the width in pixels"),
      div(code("$height"), ": the height in pixels"),
    ),
    create(arg) {
      let image = img();
      if ("$url" in this.attributes) {
        image.src = this._attributes.$url;
      } else {
        this.setAttribute("$url");
      }
      if (this._attributes.$width) {
        image.width = this._attributes.$width;
      }
      if (this._attributes.$height) {
        image.height = this._attributes.$height;
      }
      if (arg) {
        return div(image, div(arg));
      } else {
        return div(image, " ");
      }
    },
  },
  "-bg": {
    description: div(
      div("background"),
      div(code("argument"), ": a CSS color"),
      div("colors the background of children"),
    ),
    create(arg) {
      let bg = this.childrenWidget.c("bg");
      if (arg) {
        bg.style.background = arg;
        bg.style.outline = "1px solid " + arg;
      }
      return bg;
    },
  },
  "-ta": {
    description: div(div("textarea"), div("Children become lines of text.")),
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
        return div(div(arg), ta.c("indented"));
      } else {
        return div(ta, " ");
      }
    },
  },
  "-opt": {
    description: div(
      div("option"),
      div(code("$value"), ": the selected option"),
      div("children become options"),
      div("Children of the selected option are rendered below."),
    ),
    create(arg) {
      let opt = select().e("change", () => {
        this.setAttribute("$value", opt.value);
        history.add();
      });
      let optChildren = {};
      for (let child of this.childNodes) {
        opt.appendChild(option(child.nameText));
        if (child.childNodes.length) {
          optChildren[child._nameText] = child.childrenWidget;
        }
      }
      if ("$value" in this.attributes) {
        opt.value = this._attributes.$value;
      } else {
        this.setAttribute("$value", opt.value);
      }
      let elem;
      if (arg) {
        elem = div(arg, " ", opt);
      } else {
        elem = div(opt);
      }
      if (opt.value in optChildren) {
        elem.appendChild(optChildren[opt.value]);
      }
      return elem;
    },
  },
  "-rad": {
    description: div(
      div("radio buttons"),
      div("adds a radio button in front of children"),
      div(
        "If a child has a ",
        code("$name"),
        "-attribute then thats used as ",
        code("$value"),
        " for the widget.",
      ),
      div("Otherwise the childs node name is used."),
    ),
    create(arg) {
      let radio = div();
      let value;
      if ("$value" in this.attributes) {
        value = this._attributes.$value;
      } else {
        this.setAttribute("$value");
        value = "";
      }
      let grouptName = crypto.randomUUID();
      for (let child of this.childNodes) {
        let radioButton = input().a("type", "radio").a("name", grouptName);
        if ("$name" in child.attributes) {
          radioButton.a("value", child._attributes.$name);
        } else {
          radioButton.a("value", child.nameText);
        }
        radioButton.e("click", () => {
          this.setAttribute("$value", radioButton.value);
          history.add();
        });
        radioButton.checked = value == radioButton.value;
        radio.appendChild(
          div(radioButton, div(child.widget).c("rad-child"))
            .c("rad-item")
            .e("click", (ev) => ctrlClick(child, ev)),
        );
      }
      if (arg) {
        return div(div(arg), radio.c("rad"));
      } else {
        return radio;
      }
    },
  },
  "-frm": {
    description: div(
      div("form"),
      div("attributes become form fields"),
      div("If the ", code("$type"), "-attribute is set on an attribute"),
      div("then it sets the input type used in the form."),
      div(
        "Valid ",
        code("$type"),
        " values are: ",
        code("date"),
        ", ",
        code("checkbox"),
        ", ",
        code("number"),
        " and ",
        code("range"),
        ".",
      ),
      div(
        code("$min"),
        ", ",
        code("$max"),
        ", ",
        code("$step"),
        " on a ",
        code("number"),
        " or ",
        code("range"),
        " attribute node set the input options.",
      ),
      div("Non-attribute children are rendered below."),
    ),
    create(arg) {
      let form = table().c("frm-form");
      let children = div(this.childrenWidget);
      for (let attrNode of this.attrNodes) {
        if (!attrNode._isAttribute[1].startsWith("$")) {
          let entry = input().e("input", () => {
            if (entry.type == "checkbox") {
              attrNode.name.value =
                attrNode._isAttribute[1] + "=" + entry.checked;
            } else {
              attrNode.name.value =
                attrNode._isAttribute[1] + "=" + entry.value;
            }
            children.replaceChildren();
            children.appendChild(this.childrenWidget);
            history.add(true);
          });
          if (attrNode.attributes.$type) {
            let type = attrNode._attributes.$type;
            if (["date", "checkbox", "number", "range"].includes(type)) {
              entry.type = attrNode._attributes.$type;
            }

            if (["number", "range"].includes(type)) {
              if (attrNode._attributes.$min) {
                entry.min = attrNode._attributes.$min;
              }
              if (attrNode._attributes.$max) {
                entry.max = attrNode._attributes.$max;
              }
              if (attrNode._attributes.$step) {
                entry.step = attrNode._attributes.$step;
              }
            }
          }
          if (entry.type == "checkbox") {
            entry.checked = attrNode._isAttribute[2] == "true";
          } else {
            entry.value = attrNode._isAttribute[2];
          }

          form.appendChild(
            tr(td(attrNode.attrNameText), td(entry)).e("click", (ev) =>
              ctrlClick(attrNode, ev),
            ),
          );
        }
      }
      if (arg) {
        return fieldset(legend(arg), form, children).c("frm");
      } else {
        return div(form, children).c("frm");
      }
    },
  },
};
