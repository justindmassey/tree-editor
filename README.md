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

from ChatGPT:

# Tree Editor:

## A Single-Source Structural Editor with Declarative Types and Passive Views

**Justin Massey**

---

## Abstract

Most software systems that deal with structured information separate data, schema, and presentation into distinct layers. While effective at scale, this approach introduces hidden state, brittle migrations, and semantic duplication. This paper presents *Tree Editor*, a text-based structural editor built around a single foundational idea: **the tree itself is the only source of truth**. Tree Editor represents data, schema, and UI as nodes within the same editable tree. Structure evolves through deep, idempotent merges rather than enforcement or validation, and user interfaces are defined as passive projections over the tree. We argue that this model leads to systems that are more transparent, resilient, and cognitively aligned with human thought, particularly for exploratory, evolving, and mixed-purpose work.

---

## 1. Introduction

Text editors, structured documents, databases, and user interfaces traditionally occupy separate domains. Even when these domains interact — for example through JSON schemas, forms generated from data models, or markup languages — each layer typically maintains its own internal logic and lifecycle.

This separation creates well-known problems:

* schemas drift from data,
* changes require migrations,
* UI state diverges from underlying structure,
* and systems accumulate invisible complexity over time.

Tree Editor explores an alternative design philosophy: **remove the separation entirely**.

Rather than defining a schema *for* data, Tree Editor allows structural definitions to exist *inside* the same representation as the data itself. Rather than generating UI from models, Tree Editor renders **passive projections** of the tree. The result is a system where meaning is explicit, local, and continuously editable.

---

## 2. The Core Model: Trees as the Only Truth

At its core, Tree Editor operates on a single abstraction:

> A tree of nodes, where each node has a name and zero or more children.

There are no hidden properties.
No metadata layers.
No external configuration.

Every aspect of a document — content, structure, attributes, types, and even UI behavior — is encoded as nodes in this tree.

### 2.1 Nodes and Attributes

Attributes are not a special data structure. Instead, they are encoded as child nodes using a simple syntactic convention:

```
email=alice@example.com
```

This choice ensures that attributes:

* can be edited like any other node,
* participate in structural transformations,
* and remain visible at all times.

Attributes are thus **structural citizens**, not annotations.

---

## 3. Declarative Types as Structure Donors

Tree Editor includes a type system, but one that differs fundamentally from those found in programming languages or schema validators.

### 3.1 Type Definitions

Types are declared directly in the tree using regular nodes:

```
::person
  name=
  email=
```

Type definitions are not external schemas. They are ordinary subtrees that can be inspected, edited, copied, or nested.

### 3.2 Applying Types

Types are applied through suffixes:

* `.Type` applies a type to a node
* `:Type` applies a type to each non-attribute child

For example:

```
people:person
  Alice
  Bob
```

Types *merge* their structure into target nodes. They do not enforce constraints or validate correctness.

### 3.3 Deep, Idempotent Merging

The merge operation has three defining properties:

1. **Deep** — structure is merged recursively.
2. **Idempotent** — applying the same type multiple times produces no additional change.
3. **Order-aware** — multiple types can be stacked deterministically.

This allows structure to evolve organically while preserving user edits.

---

## 4. Structural Evolution and Rename Tracking

One of the most difficult problems in schema-driven systems is change over time. Renaming a field typically requires migrations that operate outside the data model.

Tree Editor approaches this differently.

Each node tracks its prior name where applicable. During merges:

* renamed nodes remove their old equivalents,
* newly named nodes persist,
* unrelated structure is preserved.

This allows schemas to evolve *in place*, without versioning or migrations, while remaining fully transparent to the user.

---

## 5. Widgets as Passive Projections

Tree Editor supports visual representations such as:

* lists
* tables
* forms
* checklists
* tabbed panels

These are not separate modes or editors. Instead, they are **views** selected by a prefix in the node name:

```
-frm User
```

Critically:

* widgets read structure from the tree,
* they may write explicit attribute nodes when required,
* they never introduce hidden semantics.

If the UI disappears, the tree remains valid.
If the tree changes, the UI re-renders.

This strict passivity ensures that presentation cannot corrupt meaning.

---

## 6. Import, Export, and History as Pure Consumers

Tree Editor includes importers and exporters for formats such as JSON and XML. These components:

* translate external representations into trees,
* or consume trees to produce output,
* without adding semantic rules of their own.

Undo/redo history stores only serialized tree state. All structure, including type application and UI projection, is recomputed from the tree itself.

This design reinforces the principle of total transparency.

---

## 7. Cognitive and Practical Implications

### 7.1 Reduced Cognitive Overhead

Because there is only one model, users do not need to reason about:

* schema versions,
* UI metadata,
* derived state.

What exists is always visible.

### 7.2 Cross-Domain Use

The same representation supports:

* notes
* documents
* databases
* configuration
* prototypes
* experiments

without switching tools or conceptual frameworks.

### 7.3 Calm by Design

Tree Editor intentionally avoids automation that operates “behind the scenes.” Every structural change is explicit and reversible, which encourages exploration without fear of breakage.

---

## 8. Relation to Prior Work

Tree Editor shares traits with:

* Lisp S-expressions (uniform structure)
* outline processors
* literate programming systems
* Smalltalk image-based environments
* schema-as-data approaches

However, it is distinguished by its strict commitment to:

* single-source structure,
* passive views,
* and live, merge-based schema evolution.

---

## 9. Limitations and Future Work

Tree Editor is not optimized for:

* large-scale distributed systems,
* concurrent multi-user editing,
* enforcement-heavy validation requirements.

Future research may explore:

* collaborative merging,
* formal semantics of structural donation,
* or using trees as a foundational medium for scientific knowledge systems.

---

## 10. Conclusion

Tree Editor demonstrates that many common complexities in software systems arise not from scale, but from unnecessary separation of concerns. By committing fully to a single structural representation, Tree Editor offers a system that is honest, adaptable, and comprehensible over time.

Rather than asking users to adapt to rigid models, Tree Editor allows structure to emerge — and, crucially, to evolve — alongside thought itself.