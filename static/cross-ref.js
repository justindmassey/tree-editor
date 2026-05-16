import { span } from "./lib/elements.js";

export default function crossRef(sectionTitle) {
  return span(
    "(see ",
    span(sectionTitle)
      .c("anchor")
      .e("click", () => {
        document.getElementById(sectionTitle).scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }),
    ")",
  );
}
