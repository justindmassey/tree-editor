 # tree-editor
 A webapp for editing trees.

Features:
 - editing commands
 - output tree with widgets
 - type system
 - import/export of text, JSON, and XML

Usage:

    cd tree-editor
    npm install
    node .

then visit localhost:3000

## Global Commands

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `Control+Alt+n` | new tree                                 |
| `Control+s`     | save the tree                            |
| `Control+Alt+d` | delete this tree                         |
| `Control+z`     | undo                                     |
| `Control+y`     | redo                                     |
| `Alt+r`         | focus root node                          |
| `Alt+j`         | focus first node with string in its name |
| `Alt+h`         | toggle help display                      |
| `Alt+m`         | toggle menu bar                          |
| `Alt+o`         | toggle output                            |
| `Alt+t`         | toggle tree                              |

---

## Node Commands

| Command                        | Description                                           |
| ------------------------------ | ----------------------------------------------------- |
| `Tab`                          | toggle visibility of children                         |
| `Shift+Enter`                  | append child                                          |
| `Alt+Shift+Enter`              | prepend child                                         |
| `Enter`                        | insert a new node after this one                      |
| `Alt+Enter`                    | append child to grandparent                           |
| `Control+d`                    | delete this node                                      |
| `Alt+ArrowUp, Control+Alt+p`   | focus previous sibling                                |
| `Alt+ArrowDown, Control+Alt+n` | focus next sibling                                    |
| `Alt+ArrowUp, Alt+Shift+P`     | move this node up                                     |
| `Alt+ArrowDown, Alt+Shift+N`   | move this node down                                   |
| `Alt+ArrowLeft`                | promote node                                          |
| `Alt+ArrowRight`               | demote node                                           |
| `Control+ArrowUp`              | roll siblings up                                      |
| `Control+ArrowDown`            | roll siblings down                                    |
| `Control+Enter`                | add a new parent node                                 |
| `Control+Shift+Enter`          | add new parent to siblings                            |
| `Control+k`                    | remove this node but keep the children                |
| `ArrowUp, Alt+p`               | focus previous node                                   |
| `ArrowDown, Alt+n`             | focus next node                                       |
| `Control+p`                    | focus the parent node                                 |
| `Alt+c`                        | copy node to clipboard                                |
| `Alt+x`                        | cut node to clipboard                                 |
| `Alt+v`                        | replace node with clipboard                           |
| `Alt+y`                        | merge clipboard into this node                        |
| `Alt+d d`                      | delete descendants                                    |
| `Alt+d a`                      | delete all attribute children                         |
| `Alt+d r`                      | replace root with this node                           |
| `Alt+s c`                      | collapse siblings                                     |
| `Alt+s s`                      | sort siblings                                         |
| `Alt+f`                        | collapse all nodes and show this one                  |
| `Alt+a`                        | collapse all descendants with only attribute children |
| `Alt+d x`                      | expand all descendants                                |
| `Alt+d c`                      | collapse all descendants                              |
| `Alt+i`                        | siblings to array (for JSON export)                   |
| `Control+g`                    | clear the current prefix command                      |

---

# Widgets

Widgets begin with `-WIDGET ARGUMENT`.

Widgets are rendered to the output.
(press Alt+o to toggle the output visibility).

Nodes that start with a hash symbol (`#`)
are not rendered to the output.

Control-click a widget in the output to focus its node.

The output is updated in real time.

The hash symbol and the dash (`-`) at the beginning of a node name
can be escaped with a backslash.

The argument is a label unless stated otherwise.

| Widget | Description                                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------- |
| `-ul`  | unordered list                                                                                                            |
| `-ol`  | ordered list                                                                                                              |
| `-hl`  | horizontal list                                                                                                           |
| `-hdr` | large header with the children below (argument = header text)                                                             |
| `-par` | paragraphs (argument = header; children become subheaders; grandchildren become paragraphs)                               |
| `-tl`  | tree link (argument = name of the tree to link to)                                                                        |
| `-lnk` | link (argument = link text; attribute `url` = target URL)                                                                 |
| `-cl`  | checklist (children become items; attribute `checked` stores state)                                                       |
| `-tbl` | table (each child name = column header; grandchildren = cells)                                                            |
| `-tbs` | tabs (child names become tabs; attribute `tab` stores the selected tab)                                                   |
| `-col` | color container (argument = CSS color used as background)                                                                 |
| `-ta`  | textarea (children become lines of text)                                                                                  |
| `-opt` | option selector (attribute `value` stores selected option; children are options; selected option’s children render below) |
| `-frm` | form (attribute nodes become form fields; non-attribute children render below)                                            |

---

# Attributes

Attributes have the form `NAME=VALUE`.

Equals symbols (`=`)
can be escaped with a backslash.

Attribute values need no escaping.

---

# Type System

Nodes with a name of the form `::TYPE`

are type definitions.

Nodes with `.TYPE` in their name

inherit from that type definition.

The dots (`.`) can be escaped with a backslash.

Children of nodes with `:TYPE` in their name

inherit from that type definition.

The colons (`:`) can be escaped with a backslash.

Type definitions can inherit from other type definitions.

Types are updated in real time.

Type definitions are not rendered to the output.

Removing a type does not remove inherited nodes.

---

# Text Export

Nodes are structured with indentation.

Text export is the only lossless one.

---

# JSON Export

Nodes and attributes become JSON properties.

Duplicate names override the last.

If node and attribute names form array indexes (`0..n-1`)

the node is exported as an array.

---

# XML Export

Nodes with children become tags.

Attribute nodes become attributes.

Nodes without children become lines of text.

Children of attribute nodes are ignored.