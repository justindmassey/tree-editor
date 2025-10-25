import Menu from "./lib/menu.js";
import { div } from "./lib/elements.js";

class TypedefMenu {
    constructor() {
        this.menu = new Menu(div("Typedefs"))
        this.elem = this.menu.elem
    }
}

export default new TypedefMenu()