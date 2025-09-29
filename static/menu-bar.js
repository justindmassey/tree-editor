import { div } from "./lib/elements.js";
import TextUploader from "./lib/text-uploader.js";
import downloadFile from "./lib/download-file.js";
import importText from "./importers/text.js";
import importJson from "./importers/json.js";
import exportToText from "./exporters/text.js";
import exportToJson from "./exporters/json.js";
import exportToXml from "./exporters/xml.js";
import tree from "./tree.js";
import history from "./history.js";
import Menu from "./lib/menu.js";


class MenuBar {
  constructor() {
    this.elem = div(
      new Menu(
        div("Import"),
        new TextUploader("Text", (text) => {
          tree.root = importText(text);
          history.add();
        }),
        new TextUploader("JSON", (json) => {
          tree.root = importJson(json);
          history.add();
        })
      ),
      new Menu(
        div("Export"),
        div("Text").e("click", () => {
          downloadFile(tree.root.name.value + ".txt", exportToText(tree.root));
        }),
        div("JSON").e("click", () => {
          downloadFile(tree.root.name.value + ".json", exportToJson(tree.root));
        }),
	div("XML").e("click", ()=> {
	  downloadFile(tree.root.name.value + ".xml", exportToXml(tree.root))
	})
      )
    ).c("menu-bar", "hidden");
  }
}

export default new MenuBar();
