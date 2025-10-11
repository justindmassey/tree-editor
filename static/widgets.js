import { div, h1, a, input } from "./lib/elements.js";
import history from "./history.js";

export default {
  ":h": {
    description: "a header",
    create(node, arg) {
      let children = div();
      for (let child of node.children.children) {
        if (!child.node.isAttribute) {
          children.appendChild(child.node.toElement());
        }
      }
      return div(h1(arg), children);
    },
  },
  ":l": {
    description: "a link",
    create(node, arg) {
      let link = a(arg).a("target", "_blank");
      if ("url" in node.attributes) {
        link.href = node._atts.url;
      } else {
        node.setAttribute("url", "");
      }
      return link;
    },
  },
  ":cl": {
    description: "a checklist",
    create(node, arg) {
      let checklist = div();
      for (let child of node.children.children) {
        if (!child.node.isAttribute) {
          let checkbox = input()
            .a("type", "checkbox")
            .e("change", () => {
              if (checkbox.checked) {
                child.node.setAttribute("checked", "true");
              } else {
                child.node.setAttribute("checked", "false");
              }
              history.add();
            });
          if ("checked" in child.node.attributes) {
            if (child.node._atts.checked == "true") {
              checkbox.checked = true;
            } else {
              checkbox.checked = false;
            }
          } else {
            child.node.setAttribute("checked", "false");
          }
          checklist.appendChild(
            div(checkbox, child.node.toElement()).c("checklist-item")
          );
        }
      }
      return checklist;
    },
  },
};
