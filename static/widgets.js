import { div, h1, a } from "./lib/elements.js";
import history from "./history.js";

export default {
  ":h": {
    description: "a header",
    create(node, arg) {
      let children = div();
      for (let child of node.children.children) {
        children.appendChild(child.node.toElement());
      }
      return div(h1(arg), children);
    },
  },
  ":l": {
    description: "a link",
    create(node, arg) {
      let link = a(arg).a("target", "_blank");
      if (node.attributes.url) {
        link.href = node._atts.url;
      } else {
        node.setAttribute("url", "");
      }
      return link
    },
  },
};
