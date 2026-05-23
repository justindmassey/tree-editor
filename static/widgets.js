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
  h2,
  button,
  img,
  h4,
} from "./lib/elements.js";
import history from "./history.js";
import Tabs from "./lib/tabs.js";
import Node from "./node.js";
import tree from "./tree.js";
import crossRef from "./cross-ref.js";

export default {
  "-txt": {
    description: div(
      div("Indented text"),
      div(
        "If a node doesn't specify a widget, it defaults to ",
        code("-txt"),
        ".",
      ),
    ),
    create(arg) {
      if (arg) {
        if (this.childrenWidget.children.length) {
          return div(div(arg), this._childrenWidget.c("indented"));
        } else {
          return div(arg);
        }
      } else {
        return this.childrenWidget;
      }
    },
  },
  "-lh": {
    description: div(
      div("Large header"),
      div("Children are rendered below."),
      div(code("argument"), ": the header text"),
    ),
    create(arg) {
      return div(h1(arg), this.childrenWidget).c("hdr");
    },
  },
  "-sh": {
    description: div(
      div("Small header"),
      div("Children are rendered below."),
      div(code("argument"), ": the header text"),
    ),
    create(arg) {
      return div(h4(arg), this.childrenWidget).c("hdr");
    },
  },
  "-sec": {
    description: div(
      div("Sections"),
      div(code("argument"), ": a header"),
      div("Each child becomes a section header."),
      div("Grandchildren become the section."),
      div("If ", code("$toc"), " is set, a table of contents is added."),
    ),
    create(arg) {
      let paragraphs = div();
      let toc = p();
      let showToc = "$toc" in this.attributes;
      for (let child of this.childNodes) {
        let header = h2(child.nameText).ctrlClick(child);
        if (showToc) {
          toc.appendChild(
            div(child._nameText)
              .c("anchor")
              .ctrlClick(child)
              .e("click", () => {
                header.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }),
          );
        }
        paragraphs.appendChild(header);
        let paragraph = p();
        for (let grandchild of child.childNodes) {
          paragraph.appendChild(grandchild.widget);
        }
        paragraphs.appendChild(paragraph);
      }
      if (showToc) {
        paragraphs = div(toc, paragraphs);
      }
      if (arg) {
        return div(h1(arg), paragraphs);
      } else {
        return div(paragraphs);
      }
    },
  },
  "-ul": {
    description: div(
      div("Unordered list"),
      div(code("$prefix"), ": added before each item"),
      div(
        "If ",
        code("$prefix"),
        " is not set, a bullet operator (",
        code("∙ "),
        ") is used.",
      ),
    ),
    create(arg) {
      let prefix = "∙ ";
      if ("$prefix" in this.attributes) {
        prefix = this._attributes.$prefix;
      }
      let children = table().c("ltbl");
      for (let child of this.childNodes) {
        children.appendChild(
          tr(
            td(prefix).ctrlClick(this._attrNodeMap.$prefix || child),
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
    description: "Ordered list",
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
  "-cl": {
    description: div(
      div("Checklist"),
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
        checkbox.ctrlClick(child._attrNodeMap.$checked || child);
        checklist.appendChild(
          div(checkbox, div(child.widget)).c("item").ctrlClick(child),
        );
      }
      if (arg) {
        if (checklist.children.length) {
          return div(div(arg), checklist.c("indented"));
        } else {
          return div(arg);
        }
      } else {
        return checklist;
      }
    },
  },
  "-tgl": {
    description: div(
      div("Toggle"),
      div("allows you to toggle the visibility of children"),
      div(code("$expanded"), ": if the children are visible"),
    ),
    create(arg) {
      let expanded = true;
      if (!("$expanded" in this.attributes)) {
        this.setAttribute("$expanded", expanded);
      } else {
        expanded = this._attributes.$expanded == "true";
      }
      let children = this.childrenWidget;
      let icon;
      if (expanded) {
        icon = "▼";
      } else {
        icon = "▶";
        children.classList.add("hidden");
      }
      let toggleButton = span(icon)
        .c("tgl-icon")
        .ctrlClick(this._attrNodeMap.$expanded || this)
        .e("click", () => {
          this.setAttribute("$expanded", !expanded);
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
  "-ln": {
    description: div(
      div("Line"),
      div("Renders children inline separated by ", code("$sep"), "."),
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
          (lastSep = div(separator).ctrlClick(this._attrNodeMap.$sep || this)),
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
  "-lnk": {
    description: div(
      div("Link"),
      div(code("argument"), ": the link text"),
      div(code("$url"), ": the URL the link opens"),
    ),
    create(arg) {
      let link = a(arg).a("target", "_blank");
      if (!("$url" in this.attributes)) {
        this.setAttribute("$url");
      }
      link.href = this._attributes.$url;
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
  "-tl": {
    description: div(
      div("Tree link"),
      div("a link to another tree"),
      div(code("argument"), ": the name of the tree to link to"),
      div(code("$label"), ": If set, it is used as the label."),
      div("If the tree doesn't exist, it's created (but not saved)."),
    ),
    create(arg, escapedArg) {
      let label = arg;
      if ("$label" in this.attributes) {
        label = this._attributes.$label;
      }
      let btn = button(label || " ")
        .ctrlClick(this._attrNodeMap.$label || this)
        .e("click", () => {
          tree.load(arg, this.attributeSubstitution(escapedArg));
        });
      if (this.childrenWidget.children.length) {
        return div(div(btn), this.childrenWidget.c("indented"));
      } else {
        return div(btn);
      }
    },
  },
  "-img": {
    description: div(
      div("Image"),
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
        if (this._attributes.$url) {
          return div(div(arg), div(image, this.childrenWidget).c("indented"));
        } else if (this.childrenWidget.children.length) {
          return div(div(arg), this._childrenWidget.c("indented"));
        } else {
          return div(arg);
        }
      } else {
        return div(div(image), this.childrenWidget);
      }
    },
  },
  "-vt": {
    description: div(
      div("Vertical Table"),
      div("Each child's name is a table header and its children the column."),
      div(
        "If a child has the attribute ",
        code("$align"),
        ", its children are aligned.",
      ),
      div(code("$align"), " can also be set for the whole table."),
      div(
        code("$align"),
        " can be ",
        code("left"),
        ", ",
        code("right"),
        " or ",
        code("center"),
        ".",
      ),
      div("If the attribute ", code("$num"), " is set on the table,"),
      div("the rows get numbered."),
    ),
    create(arg) {
      let header = tr();
      let bdy = tbody();
      let longestChild = 0;
      let numbered = "$num" in this.attributes;
      let tableAlign = this._attributes.$align || "";
      if (numbered) {
        header.appendChild(
          td("#").a("align", "center").ctrlClick(this._attrNodeMap.$num),
        );
      }
      for (let child of this.childNodes) {
        header.appendChild(td(child.nameText).ctrlClick(child));
        if (child.childNodes.length > longestChild) {
          longestChild = child._childNodes.length;
        }
      }
      for (let i = 0; i < longestChild; i++) {
        let row = tr();
        if (numbered) {
          row.appendChild(
            td(i + 1)
              .a("align", "right")
              .ctrlClick(this._attrNodeMap.$num),
          );
        }
        for (let child of this._childNodes) {
          let cell = child.childNodes[i];
          let align;
          if ("$align" in child.attributes) {
            align = child._attributes.$align;
          } else {
            align = tableAlign;
          }
          if (cell) {
            row.appendChild(td(cell.widget).a("align", align));
          } else {
            row.appendChild(td());
          }
        }
        bdy.appendChild(row);
      }
      let tbl;
      if (this._childNodes.some((n) => n._nameText)) {
        tbl = table(thead(header), bdy);
      } else {
        tbl = table(bdy);
      }
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
  "-ht": {
    description: div(
      div("Horizontal table"),
      div("children become row labels and their children the rows"),
      div("If the table has the attribute ", code("$align"), ", "),
      div("all grandchildren get alligned accordingly."),
      div(
        code("$align"),
        " can be ",
        code("left"),
        ", ",
        code("right"),
        " or ",
        code("center"),
        ".",
      ),
      div("If the attribute ", code("$num"), " is set on the table,"),
      div("the columns get numbered."),
    ),
    create(arg) {
      let tbl = table();
      let longestChild = 0;
      let align = this.attributes.$align || "";
      let numbered = "$num" in this._attributes;
      let hasLabels = this.childNodes.some((n) => n.nameText);
      let numbersRow;
      if (numbered) {
        if (hasLabels) {
          numbersRow = tr(
            td("#")
              .c("htbl-label")
              .a("align", "center")
              .ctrlClick(this._attrNodeMap.$num),
          );
        } else {
          numbersRow = tr();
        }
      }

      for (let child of this._childNodes) {
        let row;
        if (hasLabels) {
          row = tr(td(div(child.nameText).c("bold").ctrlClick(child)));
        } else {
          row = tr();
        }
        if (child.childNodes.length > longestChild) {
          longestChild = child._childNodes.length;
        }
        for (let grandchild of child.childNodes) {
          row.appendChild(td(grandchild.widget).a("align", align));
        }
        tbl.appendChild(row);
      }
      if (numbersRow) {
        for (let i = 1; i <= longestChild; i++) {
          numbersRow.appendChild(td(i).ctrlClick(this._attrNodeMap.$num));
        }
        tbl.prepend(numbersRow);
      }
      for (let row of tbl.children) {
        for (let i = row.children.length; i < longestChild + hasLabels; i++) {
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
  "-at": {
    description: div(
      div("Attribute table"),
      div("Attributes become rows in the table."),
      div("Children of attributes are added to the right column."),
      div(code("$"), "-attributes are ignored."),
      div("The first row is bold unless ", code("$nohead"), " is set."),
      div("If the attribute ", code("$num"), " is set on the table,"),
      div("the rows get numbered."),
      div("If the table has the attribute ", code("$align"), ", "),
      div("the right column gets aligned accordingly."),
      div(
        code("$align"),
        " can be ",
        code("left"),
        ", ",
        code("right"),
        " or ",
        code("center"),
        ".",
      ),
      div("Non-attribute children are rendered below the table."),
    ),
    create(arg) {
      let numbered = "$num" in this.attributes;
      let header = !("$nohead" in this._attributes);
      let align = this._attributes.$align || "";
      let atbl = table().c("atbl");
      let num = 1;
      for (let attrNode of this.attrNodes) {
        if (!attrNode._isAttribute[1].startsWith("$")) {
          let row = tr(
            td(attrNode.attrNameText),
            td(
              div(attrNode.attributeSubstitution(attrNode._isAttribute[2])),
              attrNode.childrenWidget,
            ).a("align", align),
          ).ctrlClick(attrNode);
          if (numbered) {
            row.prepend(td(num - header).a("align", "right"));
          }
          atbl.appendChild(row);
          num++;
        }
      }
      let bdy;
      if (atbl.children.length) {
        if (header) {
          atbl.firstChild.c("bold");
          atbl.firstChild.lastChild.align = "";
          if (numbered) {
            atbl.firstChild.firstChild.textContent = "#";
            atbl.firstChild.firstChild.ctrlClick(this._attrNodeMap.$num);
            atbl.firstChild.firstChild.align = "center";
          }
        }
        bdy = div(atbl);
        if (this.childrenWidget.children.length) {
          bdy.appendChild(this._childrenWidget);
        }
      } else {
        bdy = this.childrenWidget;
      }
      if (arg) {
        if (this._childrenWidget.children.length || atbl.children.length) {
          return div(div(arg), bdy.c("indented"));
        } else {
          return div(arg);
        }
      } else if (this._childrenWidget.children.length || atbl.children.length) {
        return bdy;
      } else {
        return div();
      }
    },
  },
  "-crd": {
    description: div(
      div("Card"),
      div(code("argument"), ": card header"),
      div("Children become the card body."),
      div("Attributes become a table at the bottom of the card."),
      div("Attribute children are rendered below the attribute value."),
      div(code("$"), "-attributes are ignored."),
    ),
    create(arg) {
      let attrTable = table().c("crd-attr-table");
      for (let attr of this.attrNodes) {
        if (!attr._isAttribute[1].startsWith("$")) {
          attrTable.appendChild(
            tr(
              td(attr.attrNameText),
              td(
                div(attr.attributeSubstitution(attr._isAttribute[2])),
                attr.childrenWidget,
              ),
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
  "-out": {
    description: div(
      div("Outline"),
      div("Displays children as numbered outline."),
      div("Items can also be other widgets."),
    ),
    create(arg) {
      let outline = div();
      this.traverseChildNodes((node, number) => {
        if (node != this) {
          if (node.nameValue.match(Node.widgetRegEx)) {
            outline.appendChild(
              div(span(number).c("tt"), " ", node.widget)
                .c("item")
                .ctrlClick(node),
            );
            return 1;
          } else {
            outline.appendChild(
              div(div(number).c("tt"), div(node.nameText))
                .c("item")
                .ctrlClick(node),
            );
          }
        }
      });
      if (arg) {
        if (outline.children.length) {
          return div(div(arg), outline.c("indented"));
        } else {
          return div(arg);
        }
      } else {
        return outline;
      }
    },
  },
  "-pts": {
    description: div(
      div("Paths"),
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
      for (let child of this.childNodes) {
        child.traverseChildNodes((node) => {
          if (node.nameValue.match(Node.widgetRegEx)) {
            let path = div().c("lin");
            let lastSep;
            let segments = node.getPath(this);
            let lastSegment = segments.pop();
            for (let segment of segments) {
              path.appendChild(span(segment.name).ctrlClick(segment.node));
              path.appendChild(
                (lastSep = span(separator).ctrlClick(
                  this._attrNodeMap.$sep || this,
                )),
              );
            }
            if (lastSegment) {
              path.appendChild(lastSegment.node.widget);
              path.appendChild(
                (lastSep = span(separator).ctrlClick(
                  this._attrNodeMap.$sep || this,
                )),
              );
            }
            lastSep.remove();
            pathsDiv.appendChild(path);
            return 1;
          } else if (!node.childNodes.length) {
            let path = div().c("lin");
            let lastSep;
            for (let segment of node.getPath(this)) {
              path.appendChild(span(segment.name).ctrlClick(segment.node));
              path.appendChild(
                (lastSep = span(separator).ctrlClick(
                  this._attrNodeMap.$sep || this,
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
      div("Tabs"),
      div("Each child name becomes a tab."),
      div(code("$tab"), " holds the current tab"),
      div(code("Control+Click"), "ing a child node sets the tab."),
    ),
    create(arg) {
      let tabs = new Map();
      this.attributes;
      for (let child of this.childNodes) {
        if (
          child.lastNameText != undefined &&
          child.lastNameText != child.nameText &&
          child.lastNameText == this._attributes.$tab
        ) {
          this.setAttribute("$tab", child._nameText);
        }
        child.lastNameText = child.nameText;
        tabs.set(child.nameText, child.childrenWidget);
        tabs.get(child._nameText).node = child;
      }

      let initialTab = tabs.keys().next().value;
      if ("$tab" in this._attributes && tabs.has(this._attributes.$tab)) {
        initialTab = this._attributes.$tab;
      }
      let tabsObj = new Tabs(tabs, initialTab, (tab) => {
        this.setAttribute("$tab", tab);
        history.add();
      });
      if (this._childNodes.length && !("$tab" in this._attributes)) {
        this.setAttribute("$tab", tabsObj.tab);
      }
      if (arg) {
        if (tabsObj.elem.firstChild.children.length) {
          return div(div(arg), tabsObj.elem.c("indented"));
        } else {
          return div(arg);
        }
      } else if (tabsObj.elem.firstChild.children.length) {
        return tabsObj.elem;
      } else {
        return div();
      }
    },
  },
  "-pgs": {
    description: div(
      div("Pages"),
      div("Each child becomes a page."),
      div(code("$page"), " holds the current page number."),
      div("If ", code("$page"), " is set to ", code("last"), ","),
      div("the last page is always shown."),
      div(code("Control+Click"), "ing a child node sets the page."),
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
          .ctrlClick(this._attrNodeMap.$page || this)
          .e("click", () => {
            let page = Number(this._attributes.$page);
            if (this._attributes.$page == "last") {
              this.setAttribute("$page", this._childNodes.length || "last");
            } else if (isNaN(page)) {
              this.setAttribute("$page", "last");
            } else {
              if (page <= 1 || page > this._childNodes.length) {
                this.setAttribute("$page", "last");
              } else {
                this.setAttribute("$page", page - 1);
              }
            }
            history.add();
          }),
        " ",
        div(this.attributes.$page + " / " + this._childNodes.length).c(
          "pgs-page",
        ),
        " ",
        button(">")
          .ctrlClick(this._attrNodeMap.$page || this)
          .e("click", () => {
            let page = Number(this._attributes.$page);
            if (this._attributes.$page == "last" && this._childNodes.length) {
              this.setAttribute("$page", 1);
            } else if (isNaN(page)) {
              this.setAttribute("$page", "last");
            } else {
              if (page < 1 || page >= this._childNodes.length) {
                this.setAttribute("$page", "last");
              } else {
                this.setAttribute("$page", page + 1);
              }
            }
            history.add();
          }),
      )
        .c("pgs-pager")
        .ctrlClick(this._attrNodeMap.$page || this);
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
  "-opt": {
    description: div(
      div("Options"),
      div(code("$value"), ": the selected option"),
      div("children become options"),
      div("Children of the selected option are rendered below."),
      div(code("Control+Click"), "ing a child node sets the selection."),
    ),
    create(arg) {
      let opt = select().e("change", () => {
        this.setAttribute("$value", opt.value);
        history.add();
      });
      let optChildren = Object.create(null);
      let options = Object.create(null);
      for (let child of this.childNodes) {
        if (
          child.lastNameText != undefined &&
          child.lastNameText != child.nameText &&
          child.lastNameText == this.attributes.$value
        ) {
          this.setAttribute("$value", child._nameText);
        }
        child.lastNameText = child.nameText;
        if (options[child._nameText]) {
          options[child._nameText].remove();
        }
        options[child._nameText] = option(child._nameText).a(
          "value",
          child._nameText,
        );
        opt.appendChild(options[child._nameText]);
        if (child.childNodes.length) {
          optChildren[child._nameText] = child.childrenWidget;
        }
      }
      if ("$value" in this.attributes) {
        opt.value = this._attributes.$value;
      } else if (this._childNodes.length) {
        this.setAttribute("$value", opt.value);
      }
      opt.ctrlClick(this._attrNodeMap.$value || this);
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
      div("Radio buttons"),
      div("Adds a radio button in front of children."),
      div(
        "If a child has a ",
        code("$name"),
        "-attribute then that's used as ",
        code("$value"),
        " for the widget.",
      ),
      div("Otherwise the child's node name is used."),
      div(code("Control+Click"), "ing a child node sets the selection."),
    ),
    create(arg) {
      let radio = div();
      let groupName = crypto.randomUUID();
      this.attributes;
      for (let child of this.childNodes) {
        let radioButton = input().a("type", "radio").a("name", groupName);
        let name;
        if ("$name" in child.attributes) {
          name = child._attributes.$name;
        } else {
          name = child.nameText;
        }
        if (
          child.lastNameText != undefined &&
          child.lastNameText != name &&
          child.lastNameText == this._attributes.$value
        ) {
          this.setAttribute("$value", name);
        }
        child.lastNameText = name;
        radioButton.a("value", name);
        radioButton.ctrlClick(this._attrNodeMap.$value || child);
        radioButton.e("click", () => {
          this.setAttribute("$value", radioButton.value);
          history.add();
        });
        radioButton.checked = this._attributes.$value == radioButton.value;
        radio.appendChild(
          div(radioButton, div(child.widget)).c("item").ctrlClick(child),
        );
      }
      if (arg) {
        if (radio.children.length) {
          return div(div(arg), radio.c("indented"));
        } else {
          return div(arg);
        }
      } else {
        return radio;
      }
    },
  },
  "-ta": {
    description: div(div("Textarea"), div("Children become lines of text.")),
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
        lines.push(child.node.nameValue);
      }
      ta.value = lines.join("\n");
      if (arg) {
        return div(div(arg), ta.c("indented"));
      } else {
        return div(ta);
      }
    },
  },
  "-frm": {
    description: div(
      div("Form"),
      div("Attributes become form fields ", crossRef("Attributes"), "."),
      div("Attribute children are rendered below the field value"),
      div(code("$"), "-attributes are ignored."),
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
        ", ",
        code("range"),
        " and ",
        code("color"),
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
      let attrChildren = Object.create(null);
      for (let attrNode of this.attrNodes) {
        if (!attrNode._isAttribute[1].startsWith("$")) {
          attrChildren[attrNode._isAttribute[1]] = div(attrNode.childrenWidget);
          let entry = input().e("input", () => {
            if (entry.type == "checkbox") {
              attrNode.nameValue =
                attrNode._isAttribute[1] + "=" + entry.checked;
            } else {
              attrNode.nameValue = attrNode._isAttribute[1] + "=" + entry.value;
            }
            children.replaceChildren(...this.childrenWidget.children);
            attrChildren[attrNode._isAttribute[1]].replaceChildren(
              ...attrNode.childrenWidget.children,
            );
            history.add(true);
          });
          if (attrNode.attributes.$type) {
            let type = attrNode._attributes.$type;
            if (
              ["date", "checkbox", "number", "range", "color"].includes(type)
            ) {
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
            tr(
              td(attrNode.attrNameText).a("align", "right"),
              td(entry),
            ).ctrlClick(attrNode),
          );
          if (attrNode.childrenWidget.children.length) {
            form.appendChild(
              tr(td(), td(attrChildren[attrNode._isAttribute[1]])),
            );
          }
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
  "-bg": {
    description: div(
      div("Background"),
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
  "-cen": {
    description: "Center horizontally",
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
  "-tt": {
    description: div(div("Teletype"), div("uses monospace font")),
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
  "-st": {
    description: div(
      div("Style text"),
      div(
        "You can set multiple ",
        code("$text"),
        "-attributes on this widget.",
      ),
      div(
        div(
          "The value of ",
          code("$text"),
          " is the text within the widget to be styled",
        ),
        div("(matched case insensitively)."),
      ),
      div("If a ", code("$text"), "-attribute has an empty value,"),
      div("it matches all text."),
      div(
        div("The children of the", code("$text"), "-attributes"),
        div(
          "are the ",
          a("CSS properties").a(
            "href",
            "https://developer.mozilla.org/docs/Web/CSS/Reference/Properties",
          ),
          " to be applied to the matched text",
        ),
        div(
          "(for example: ",
          code("background=yellow"),
          " or ",
          code("font-weight=bold"),
          ").",
        ),
        div(
          "Text within previous ",
          code("$text"),
          "-matches can be mached by later ones.",
        ),
      ),
    ),
    create(arg) {
      let widget;
      if (arg) {
        if (this.childrenWidget.children.length) {
          widget = div(div(arg), this._childrenWidget.c("indented"));
        } else {
          widget = div(arg);
        }
      } else {
        widget = this.childrenWidget;
      }
      for (let attr of this.attrNodes) {
        if (attr._isAttribute[1] == "$text") {
          let text = attr.attributeSubstitution(attr._isAttribute[2]);
          styleText(widget, text, attr.attributes);
        }
      }
      return widget;
    },
  },
};

export function updateSelection(ev) {
  if (ev.ctrlKey && this.parent && this.parent.childNodes.includes(this)) {
    ev.preventDefault();
    let m = this.parent.nameValue.match(Node.widgetRegEx);
    if (m) {
      let widget = m[1];
      if (widget == "-opt") {
        this.parent.updateAttribute("$value", this.nameText);
      }
      if (widget == "-tbs") {
        this.parent.updateAttribute("$tab", this.nameText);
      }
      if (widget == "-pgs") {
        let page = this.parent.childNodes.indexOf(this) + 1;
        this.parent.updateAttribute("$page", page);
      }
      if (widget == "-rad") {
        if ("$name" in this.attributes) {
          this.parent.updateAttribute("$value", this._attributes.$name);
        } else {
          this.parent.updateAttribute("$value", this.nameText);
        }
      }
    }
  }
}

function styleText(root, text, styles) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }
  if (text) {
    const search = text.toLowerCase();

    for (const node of textNodes) {
      const value = node.nodeValue;
      const lower = value.toLowerCase();
      if (!lower.includes(search)) {
        continue;
      }
      const fragment = document.createDocumentFragment();
      let start = 0;
      while (true) {
        const index = lower.indexOf(search, start);

        if (index === -1) {
          break;
        }
        fragment.append(value.slice(start, index));
        const textElem = span(value.slice(index, index + text.length)).c("st");
        for (const [key, value] of Object.entries(styles)) {
          textElem.style[key] = value;
        }
        fragment.append(textElem);
        start = index + text.length;
      }

      fragment.append(value.slice(start));

      node.replaceWith(fragment);
    }
  } else {
    for (const node of textNodes) {
      const value = node.nodeValue;
      const textElem = span(value).c("st");
      for (const [key, value] of Object.entries(styles)) {
        textElem.style[key] = value;
        node.replaceWith(textElem);
      }
    }
  }
}
