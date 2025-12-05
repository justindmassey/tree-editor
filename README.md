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

# Tree Editor: A Declarative Tree-Based System for Unified Human and Machine Knowledge Representation

## Abstract

This paper presents *Tree Editor*, a declarative, tree-based information system designed to unify human-authored text, structured data, and semantic typing within a single formal representation. Tree Editor adopts an indentation-based tree as its sole source of truth and applies explicit type inheritance and idempotent deep merging to derive structure without hidden state or imperative transformation. Unlike conventional document formats, schema languages, or databases, Tree Editor eliminates representational dualities by treating structure, schema, and instance data as manifestations of the same underlying tree. We describe the formal principles of the system, analyze its type semantics, and discuss implications for knowledge work, scientific modeling, and long-term information durability.

---

## 1. Introduction

Contemporary information systems are characterized by representational fragmentation. Human-readable documents, machine-readable schemas, executable logic, and persistent storage are typically expressed using distinct formalisms, each with its own tooling and cognitive model. This fragmentation introduces impedance mismatches that increase system complexity, reduce transparency, and complicate long-term maintenance.

Tree Editor proposes an alternative approach: a single declarative structure in which all information is expressed as a tree and authored directly by humans. Rather than translating between representations, Tree Editor interprets structure, typing, and defaults through explicit, deterministic operations on the tree itself.

This work investigates whether a minimal tree formalism can serve as a unified substrate for informal knowledge capture and formally structured systems without sacrificing readability, correctness, or extensibility.

---

## 2. Formal Model

### 2.1 Tree as Canonical Representation

In Tree Editor, all information is represented as a rooted, ordered tree. Nodes consist of:

* A textual label
* Zero or more attributes
* Zero or more child nodes

Parent–child relationships are defined exclusively by indentation. No implicit grouping, enclosure syntax, or external schema is permitted. The tree text is the authoritative representation; all derived views or interpretations must be reducible to it.

This constraint guarantees **representational closure**: any semantic element influencing interpretation must be visible and inspectable in the tree itself.

---

### 2.2 Explicit Semantics and Absence of Implicit State

Tree Editor explicitly rejects hidden state. There is no background metadata, no inferred structure beyond declared types, and no imperative operations that mutate semantics indirectly. As a result, the system satisfies a strong locality property: understanding a subtree does not require inspecting distant configuration files or runtime code.

---

## 3. Type System

### 3.1 Types as Declarative Trees

Types in Tree Editor are defined as explicit subtrees. A type definition specifies:

* Structural defaults
* Attribute defaults
* Child node templates

Types may inherit from other types, forming a directed acyclic graph of type definitions. Importantly, types are not schemas imposed on data; they are structural trees merged into instance trees.

---

### 3.2 Idempotent Deep Merge Semantics

Applying a type to a node results in a **deep merge** of the type tree into the node subtree. This merge operation has three defining properties:

1. **Idempotence**
   Reapplying the same type produces no additional effects.

2. **Determinism**
   Merge order is explicit and predictable.

3. **Non-destructiveness**
   User-authored structure and attributes are preserved unless explicitly overridden.

These properties distinguish Tree Editor from template expansion systems and schema migration approaches, which often rely on one-time or destructive transformations.

---

## 4. Separation of Semantics and Projection

### 4.1 Passive Widgets

Tree Editor introduces widgets as optional, passive annotations that project tree data into alternative visual or interactive forms (e.g., tables or forms). Widgets do not introduce structure, modify data, or alter semantics. Their passivity ensures that semantic interpretation remains independent of user interface concerns.

---

### 4.2 Pure Import and Export Functions

Importers and exporters are constrained to pure transformations:

* Importers construct trees from external representations.
* Exporters consume trees to produce external artifacts.

No exporter may influence or reinterpret tree semantics. This guarantees that information integrity is preserved across tooling and transport boundaries.

---

## 5. Relation to Prior Work

Tree Editor intersects with several existing paradigms but diverges in critical ways:

* Compared to YAML and JSON, Tree Editor defines semantics rather than mere serialization.
* Compared to Org-mode, it formalizes typing and inheritance.
* Compared to schema systems such as GraphQL or CUE, it prioritizes human authorship over validation constraints.
* Compared to databases, it avoids externalized schema enforcement and migration logic.

Tree Editor occupies a distinct design space: **human-first declarative structure with formal semantics**.

---

## 6. Applications

### 6.1 Knowledge Capture and Evolution

Tree Editor enables progressive formalization: users may begin with informal notes and later introduce structure and typing without rewriting content. This supports exploratory thinking while preserving future rigor.

---

### 6.2 Scientific Modeling

The explicitness of assumptions and inheritance relationships makes Tree Editor suitable for scientific contexts where transparency, reproducibility, and structural reasoning are critical. Models evolve through visible tree modifications rather than opaque versioned schemas.

---

### 6.3 Software Configuration and System Design

By replacing fragmented configuration formats with a typed tree, Tree Editor reduces schema drift and improves auditability. Configuration becomes inspectable, composable, and explainable.

---

## 7. Design Philosophy

Tree Editor is guided by several principles:

* **Transparency**: no hidden behavior
* **Minimality**: few primitives, strong composition
* **Local reasoning**: semantics are structurally proximal
* **Durability**: plain text as a long-term medium

These principles collectively favor clarity over premature optimization or abstraction.

---

## 8. Limitations and Future Work

Current limitations include scalability concerns for very large trees and the cognitive load of understanding deep merge semantics. Future work includes formalization of merge algebra, distributed editing models, semantic differencing, and alternative persistence layers.

---

## 9. Conclusion

Tree Editor demonstrates that a single declarative tree formalism can unify human-readable text, structure, and typing without auxiliary schema languages or imperative transformation layers. By enforcing explicitness and idempotent composition, the system reduces complexity while increasing transparency.

Tree Editor suggests a path toward information systems that are both formally rigorous and fundamentally humane—where structure is not imposed upon human expression, but emerges from it.