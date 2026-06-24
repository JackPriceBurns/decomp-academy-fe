---
id: structs-linked-list
title: Walking a Linked List
difficulty: 3
concepts:
  - structs
  - linked-list
  - loops
  - pointers
symbol: List_last
hints:
  - Loop `while (n->next != NULL) n = n->next;` and return `n`.
  - Each step reloads `lwz r0, 0(r3)` and tests it with `cmplwi r0, 0`.
---

# p = p->next

A self-referential struct holds a pointer to its own type. Walking the list is a
loop that **reloads the `next` field each iteration** until it's NULL. Given:

```c
typedef struct Node { struct Node* next; int value; } Node;
```

`next` is at offset 0, so following it is `lwz r0, 0(r3)`, then a compare against
zero decides whether to continue:

```asm
       b       check
loop:  mr      r3, r0       # n = n->next
check: lwz     r0, 0(r3)    # load n->next
       cmplwi  r0, 0        # next != NULL ?
       bne+    loop
       blr                  # return last node (still in r3)
```

The repeated `lwz` of the same offset feeding a NULL test and a branch is the
fingerprint of a linked-list traversal. The `cmplwi` (unsigned compare) reflects
that `next` is a pointer, not a signed integer.

Don't be fooled by the leading `b check`: MWCC compiles the `while` loop into a
"test at the bottom" shape, branching to the condition first so the body and the
test share one block. A plain `while` in C produces this exact asm — you do *not*
need a `do`/`while` to match it.

## Your task

With `Node` above, write `List_last` that follows `next` until it is NULL and
returns the final node.

<!-- starter -->
```c
Node* List_last(Node* n) {
    return n;
}
```

<!-- solution -->
```c
Node* List_last(Node* n) {
    while (n->next != NULL) {
        n = n->next;
    }
    return n;
}
```

<!-- context -->
```c
typedef struct Node { struct Node* next; int value; } Node;
```
