import { div } from "./lib/elements.js";
import TextUploader from "./lib/text-uploader.js";
import downloadFile from "./lib/download-file.js";
import importTree from "./importers/tree.js";
import importJson from "./importers/json.js";
import importXml from "./importers/xml.js";
import exportToTree from "./exporters/tree.js";
import exportToJson from "./exporters/json.js";
import exportToXml from "./exporters/xml.js";
import tree from "./tree.js";
import history from "./history.js";
import Menu from "./lib/menu.js";
import treeMenu from "./tree-menu.js";
import typedefMenu from "./typedef-menu.js";
import recentlyEditedMenu from "./recently-edited-menu.js";

class MenuBar {
  constructor() {
    this.elem = div(
      treeMenu,
      recentlyEditedMenu,
      typedefMenu,
      new Menu(
        "Import",
        new TextUploader("Tree", ".tree", (text, filename) => {
          tree.root = importTree(text, removeExtension(filename));
          tree.root.focus();
          history.clear();
          history.add();
        }),
        new TextUploader("JSON", ".json", (json, filename) => {
          try {
            tree.root = importJson(json, removeExtension(filename));
          } catch (e) {
            alert("Import failed: " + e.message);
            return;
          }
          tree.root.focus();
          history.clear();
          history.add();
        }),
        new TextUploader("XML", ".xml", (xml) => {
          tree.root = importXml(xml);
          tree.root.focus();
          history.clear();
          history.add();
        })
      ),
      new Menu(
        "Export",
        div("Tree").e("click", () => {
          downloadFile(tree.name + ".tree", exportToTree(tree.root));
        }),
        div("JSON").e("click", () => {
          downloadFile(tree.name + ".json", exportToJson(tree.root));
        }),
        div("XML").e("click", () => {
          let xml = exportToXml(tree.root);
          if (xml) {
            downloadFile(tree.name + ".xml", xml);
          }
        })
      )
    ).c("menu-bar", "hidden");
  }
}

export default new MenuBar();

function removeExtension(s) {
  return s.replace(/\.[^\.]*$/, "");
}