import { ol, li } from "./lib/elements.js"

function NodeToLi(node) {
    if(node.children.children.length) {
        let n = li(node.name.value)
        let c = ol()
        for(let child of node.children.children) {
            for(let item of NodeToLi(child.node)) {
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
    for(let item of NodeToLi(node)) {
        list.appendChild(item)
    }
    return list
}