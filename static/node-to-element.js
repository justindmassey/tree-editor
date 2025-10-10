import { ol, li } from "./lib/elements.js"
import renderers from "./renderers.js"

function NodeToItems(node) {
    let m = node.name.value.match(/^(:\S+)\s*(.*)/)
    if(m && renderers[m[1]]) {
        return [li(renderers[m[1]].render(node, m[2]))]
    }
    if(node.children.children.length) {
        let n = li(node.name.value)
        let c = ol()
        for(let child of node.children.children) {
            for(let item of NodeToItems(child.node)) {
                c.appendChild(item)
            }
        }
        return [n, c]
    } else {
        return [li(node.name.value)]
    }
}

export default function nodeToElement(node) {
    
    let list = ol()
    for(let item of NodeToItems(node)) {
        list.appendChild(item)
    }
    return list
}