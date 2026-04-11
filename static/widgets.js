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
import tree from "./tree.js";

export default {
  "-hdr": {
    description: div(
      div("large header with the children below"),
      div(code("argument"), ": the header text"),
    ),
    create(arg) {
      return div(h1(arg), this.childrenWidget).c("hdr");
    },
  },
  "-ul": {
    description: div(
      div("unordered list"),
      div(code("$bullet"), ": the bullet to be used"),
      div("If ", code("$bullet"), " is not set, a bullet operator is used."),
    ),
    create(arg) {
      let bullet = "∙ ";
      if ("$bullet" in this.attributes) {
        bullet = this._attributes.$bullet;
      }
      let children = table().c("ltbl");
      for (let child of this.childNodes) {
        children.appendChild(
          tr(
            td(bullet).ctrlClick(this._attrNodes.$bullet || child),
            td(child.widget),
          ),
        );
      }
      if (children.children.length) {
        if (arg) {
          return div(div(arg), children.c("indented"));
        } else {
          return children;
        }
      } else {
        return div(arg);
      }
    },
  },
  "-ol": {
    description: "ordered list",
    create(arg) {
      let children = table().c("ltbl");
      let cnt = 1;
      for (let child of this.childNodes) {
        children.appendChild(
          tr(td(cnt + ". "), td(child.widget)).ctrlClick(child),
        );
        cnt++;
      }
      if (children.children.length) {
        if (arg) {
          return div(div(arg), children.c("indented"));
        } else {
          return children;
        }
      } else {
        return div(arg);
      }
    },
  },
  "-tgl": {
    description: div(
      div("toggle"),
      div("allows you to toggle the visibility of children"),
      div(code("$expanded"), ": if the children are visible"),
    ),
    create(arg) {
      let expanded = true;
      if (!("$expanded" in this.attributes)) {
        this.setAttribute("$expanded", true);
      } else {
        expanded = this._attributes.$expanded == "true";
      }
      let children = this.childrenWidget;
      if (!expanded) {
        children.classList.add("hidden");
      }
      let icon;
      if (expanded) {
        icon = "▼";
      } else {
        icon = "▶";
      }
      let toggleButton = span(icon)
        .c("tgl-icon")
        .ctrlClick(this._attrNodes.$expanded || this)
        .e("click", () => {
          if (expanded) {
            this.setAttribute("$expanded", false);
          } else {
            this.setAttribute("$expanded", true);
          }
          history.add();
        });
      if (arg) {
        if (children.children.length) {
          return div(div(toggleButton, " ", arg), children.c("indented"));
        } else {
          return div(toggleButton, " ", arg);
        }
      } else {
        return div(div(toggleButton), children);
      }
    },
  },
  "-lin": {
    description: div(
      div("line"),
      div("renders children as a line separated by ", code("$sep")),
      div("If ", code("$sep"), " is not set, a space is used."),
    ),
    create(arg) {
      let separator = " ";
      if ("$sep" in this.attributes) {
        separator = this._attributes.$sep;
      }
      let line = span().c("lin");
      let lastSep;
      for (let child of this.childNodes) {
        line.appendChild(child.widget);
        line.appendChild(
          (lastSep = div(separator).ctrlClick(this._attrNodes.$sep || this)),
        );
      }
      if (lastSep) {
        lastSep.remove();
      }

      if (arg) {
        if (line.children.length) {
          return div(div(arg), div(line).c("indented"));
        } else {
          return div(arg);
        }
      } else {
        return div(line);
      }
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
        paragraphs.appendChild(h4(child.nameText).ctrlClick(child));
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
  "-tl": {
    description: div(
      div("tree link"),
      div("a link to another tree"),
      div(code("argument"), ": the name of the tree to link to"),
      div(code("$label"), ": If set, it is used as the label."),
      div("If the tree doesn't exist, it's created (but not saved)."),
      div("Because the tree name is a widget argument,"),
      div("trees with leading whitespace in their name can't be linked to."),
    ),
    create(arg, unescapedArg) {
      let label = unescapedArg;
      if ("$label" in this.attributes) {
        label = this._attributes.$label;
      }
      let btn = button(label || " ").e("click", () => {
        tree.load(unescapedArg);
      });
      if (this.childrenWidget.children.length) {
        return div(div(btn), this.childrenWidget.c("indented"));
      } else {
        return div(btn);
      }
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
        link.href = "";
      }
      if (arg) {
        if (this.childrenWidget.children.length) {
          return div(div(link), this._childrenWidget.c("indented"));
        } else {
          return div(link);
        }
      } else {
        return this.childrenWidget;
      }
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
          child.attributes;
        }
        checkbox.ctrlClick(child._attrNodes.$checked || child);
        checklist.appendChild(
          div(checkbox, div(child.widget).c("cl-child"))
            .c("cl-item")
            .ctrlClick(child),
        );
      }
      if (arg) {
        if (checklist.children.length) {
          return div(div(arg), checklist.c("cl"));
        } else {
          return div(arg);
        }
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
        header.appendChild(td(child.nameText).ctrlClick(child));
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
        if (header.children.length) {
          return div(div(arg), tbl.c("indented")).c("tbl");
        } else {
          return div(arg);
        }
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
        let row = tr(td(div(child.nameText).c("htbl-label").ctrlClick(child)));
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
        if (tbl.children.length) {
          return div(div(arg), tbl.c("indented")).c("tbl");
        } else {
          return div(arg);
        }
      } else {
        return tbl.c("tbl");
      }
    },
  },
  "-crd": {
    description: div(
      div("card"),
      div(code("argument"), ": card header"),
      div("Children become the card body."),
      div("Attributes become a table at the bottom of the card."),
      div(code("$"), "-attributes are ignored."),
    ),
    create(arg) {
      let attrTable = table().c("crd-attr-table");
      for (let attr of this.attrNodes) {
        if (!attr._isAttribute[1].startsWith("$")) {
          attrTable.appendChild(
            tr(
              td(attr.attrNameText),
              td(attr.attributeSubstitution(attr._isAttribute[2])),
            ).ctrlClick(attr),
          );
        }
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
      return crd.c("crd");
    },
  },
  "-pts": {
    description: div(
      div("paths"),
      div(
        "renders the path (separated by ",
        code("$sep"),
        ") of each leaf node",
      ),
      div(
        "If ",
        code("$sep"),
        " is not set, the separator defaults to a space.",
      ),
    ),
    create(arg) {
      let separator;
      if ("$sep" in this.attributes) {
        separator = this._attributes.$sep;
      } else {
        separator = " ";
      }

      let pathsDiv = div();
      for (let child of this.children.children) {
        if (child.node.isAttribute && child.node._isAttribute[1] == "$sep") {
          continue;
        }

        child.node.traverse((node) => {
          if (!node.children.children.length) {
            let path = div();
            let lastSep;
            for (let segment of node.getPath(this)) {
              path.appendChild(span(segment.name).ctrlClick(segment.node));
              path.appendChild(
                (lastSep = span(separator).ctrlClick(
                  this._attrNodes.$sep || this,
                )),
              );
            }
            lastSep.remove();
            pathsDiv.appendChild(path);
          }
        });
      }

      if (arg) {
        if (pathsDiv.children.length) {
          return div(div(arg), pathsDiv.c("indented"));
        } else {
          return div(arg);
        }
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
      let tabs = new Map();
      this.attributes;
      for (let child of this.childNodes) {
        if (
          child.lastNameText != undefined &&
          child.lastNameText == this._attributes.$tab
        ) {
          this.setAttribute("$tab", child.nameText);
        }
        child.lastNameText = child.nameText;
        tabs.set(child.nameText, child.childrenWidget);
        tabs.get(child._nameText).node = child;
      }

      let initialTab = tabs.keys().next().value;
      if ("$tab" in this.attributes && tabs.has(this._attributes.$tab)) {
        initialTab = this._attributes.$tab;
      }
      let tabsObj = new Tabs(tabs, initialTab, (tab) => {
        this.setAttribute("$tab", tab);
        history.add();
      });
      this.setAttribute("$tab", tabsObj.tab);
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
      div("If ", code("$page"), " is set to ", code("last"), ","),
      div("the last page is always shown."),
    ),
    create(arg) {
      if (!("$page" in this.attributes)) {
        this.setAttribute("$page", "last");
      }
      this.childrenWidget;
      let page;
      if (this._attributes.$page == "last" && this._childNodes.length) {
        page = this._childNodes[this._childNodes.length - 1].widget;
      } else if (this.childNodes[this.attributes.$page - 1]) {
        page = this._childNodes[this._attributes.$page - 1].widget;
      }
      let pager = div(
        button("<")
          .ctrlClick(this._attrNodes.$page || this)
          .e("click", () => {
            let page = Number(this._attributes.$page);
            if (
              this._attributes.$page == "last" &&
              this.childNodes.length >= 2
            ) {
              this.setAttribute("$page", this._childNodes.length - 1);
            } else if (isNaN(page)) {
              this.setAttribute("$page", 1);
            } else {
              if (page <= 1 || page > this._childNodes.length) {
                this.setAttribute("$page", this._childNodes.length || 1);
              } else {
                this.setAttribute("$page", page - 1);
              }
            }
            history.add();
          }),
        " ",
        div(this.attributes.$page + " / " + this.childNodes.length).c(
          "pgs-page",
        ),
        " ",
        button(">")
          .ctrlClick(this._attrNodes.$page || this)
          .e("click", () => {
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
      )
        .c("pgs-pager")
        .ctrlClick(this._attrNodes.$page || this);
      if (arg) {
        if (page) {
          return div(arg, " ", pager, div(page).c("indented"));
        } else {
          return div(arg, " ", pager);
        }
      } else {
        if (page) {
          return div(pager, div(page));
        } else {
          return div(pager);
        }
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
        return div(div(arg), div(image, this.childrenWidget).c("indented"));
      } else {
        return div(div(image), this.childrenWidget);
      }
    },
  },
  "-tt": {
    description: div(div("teletype"), div("uses monospace font")),
    create(arg) {
      if (arg) {
        if (this.childrenWidget.children.length) {
          return div(div(arg), this._childrenWidget.c("indented")).c("tt");
        } else {
          return div(arg).c("tt");
        }
      } else {
        return this.childrenWidget.c("tt");
      }
    },
  },
  "-cen": {
    description: "center horizontally",
    create(arg) {
      if (arg) {
        if (this.childrenWidget.children.length) {
          return div(div(div(arg), this._childrenWidget.c("indented"))).c(
            "cen",
          );
        } else {
          return div(arg).c("cen");
        }
      } else {
        return div(this.childrenWidget).c("cen");
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
        return div(ta);
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
        if (arg) {
          if (optChildren[opt.value].children.length) {
            elem.appendChild(optChildren[opt.value].c("indented"));
          }
        } else {
          elem.appendChild(optChildren[opt.value]);
        }
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
        "-attribute then that's used as ",
        code("$value"),
        " for the widget.",
      ),
      div("Otherwise the child's node name is used."),
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
      let groupName = crypto.randomUUID();
      for (let child of this.childNodes) {
        let radioButton = input().a("type", "radio").a("name", groupName);
        if ("$name" in child.attributes) {
          radioButton.a("value", child._attributes.$name);
        } else {
          radioButton.a("value", child.nameText);
        }
        radioButton.ctrlClick(child);
        radioButton.e("click", () => {
          this.setAttribute("$value", radioButton.value);
          history.add();
        });
        radioButton.checked = value == radioButton.value;
        radio.appendChild(
          div(radioButton, div(child.widget).c("rad-child"))
            .c("rad-item")
            .ctrlClick(child),
        );
      }
      if (arg) {
        if (radio.children.length) {
          return div(div(arg), radio.c("rad"));
        } else {
          return div(arg);
        }
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
      let children = this.childrenWidget;
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
            children.replaceChildren(...this.childrenWidget.children);

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
            tr(td(attrNode.attrNameText), td(entry)).ctrlClick(attrNode),
          );
        }
      }
      if (arg) {
        return fieldset(legend(arg), form, children).c("frm");
      } else {
        if (form.children.length) {
          return div(form, children).c("frm");
        } else {
          return children;
        }
      }
    },
  },
};
