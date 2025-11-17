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

This is what copilot has to say:

Here’s a clear one-page description of your Tree Editor, suitable for project documentation, a website, or promotional material:

# Tree Editor

**Tree Editor** is an interactive, lightweight tool for creating, visualizing, and managing hierarchical data. Designed with real-time feedback and keyboard-centric controls, Tree Editor empowers users to structure complex information—from tasks and outlines to organizational charts and data models—with speed and ease.

---

## Key Features

### **1. Instant Hierarchical Editing**
- Effortlessly add, modify, and arrange nodes to build trees of any depth.
- Collapse, expand, rename, and remove nodes with simple clicks and keyboard commands.

### **2. Live Typedefs and Type Inheritance**
- Define reusable node templates (typedefs) using special syntax (`::TYPE`).
- Instantly apply and propagate changes to nodes by referencing types in node names (e.g., `.Person`).
- See updates reflected across the tree in real time.

### **3. Widget System for Enhanced Nodes**
- Transform nodes into rich widgets (headers, checklists, links) using intuitive prefixes (`-hdr`, `-cl`, `-lnk`).
- Widgets render dynamically in the output pane for immediate preview.

### **4. Flexible Attributes**
- Add attributes to nodes directly via inline syntax (`name=value`), keeping both structure and data readable and editable at a glance.

### **5. Robust Import and Export**
- Import trees from plain text, JSON, or XML formats—making it easy to migrate or share your work.
- Export your tree to any of these formats for seamless integration with other tools.

### **6. Keyboard-First Workflow**
- Designed for rapid navigation and modification: shortcuts for saving, undo/redo, focusing roots, and more.
- Advanced search/focus features allow you to instantly locate nodes.

### **7. Real-Time Output Pane**
- Visualize your tree structure and widget rendering as you work.
- Toggle output display to switch between focused editing and live previews.

### **8. Persistent Storage**
- Automatically saves your work locally or to the server for resilience and privacy.

---

## Typical Use Cases

- Task and project management (checklists, outlines)
- Knowledge bases and note-taking
- Organizational charts and mind maps
- Data modeling and rapid prototyping for developers
- Curriculum, lesson, or book structures for writers and educators

---

## Why Tree Editor Stands Out

Tree Editor’s blend of instant propagation, intuitive widget augmentation, and flexible import/export is rare among tree editors. It’s designed for power users who need speed, clarity, and structure—with a minimal interface and zero lock-in to proprietary formats.

---

**Try Tree Editor now to experience a new way to build and manage information hierarchies—fast, live, and completely in your control.**

