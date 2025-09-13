import { label, input } from "./elements.js";

export default class TextUploader {
  constructor(title, onupload) {
    this.onupload = onupload;
    this.elem = label(
      title,
      input()
        .a("type", "file")
        .c("hidden")
        .e("change", (ev) => this.onchange(ev))
    );
  }

  onchange(ev) {
    var reader = new FileReader();
    reader.readAsText(ev.target.files[0], "UTF-8");
    reader.onload = (ev) => this.onupload(ev.target.result);
  }
}
