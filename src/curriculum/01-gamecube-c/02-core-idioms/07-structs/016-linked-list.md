---
id: 850855d3-8a90-5394-b2ec-7cf17ea7c023
slug: structs-linked-list
title: Walking a Linked List
difficulty: 3
concepts:
  - structs
  - linked-list
  - loops
  - pointers
symbol: func_80142154
hints:
  - Loop `while (n->next != NULL) n = n->next;` and return `n`.
  - Each step reloads `lwz r0, 0(r3)` and tests it with `cmplwi r0, 0`.
---

# p = p->next

A struct can hold a pointer to its own type. That's all a linked list is: each
node knows where the next one lives. To reach the final node, you walk. Loop
over the chain, and every time grab `next` from memory before testing it for
NULL. Skip the re-fetch and the loop never advances — you'd read the same node
forever.

```c
typedef struct Node { struct Node* next; int value; } Node;
```

`next` is first in the struct, offset 0, so following it is a lone
`lwz r0, 0(r3)`. Then zero-compare the result: nonzero, keep walking; zero,
you're done.

```asm
       b       check
loop:  mr      r3, r0       # n = n->next
check: lwz     r0, 0(r3)    # load n->next
       cmplwi  r0, 0        # next != NULL ?
       bne+    loop
       blr                  # return last node (still in r3)
```

Load from offset 0, check for NULL, branch back, repeat. That rhythm is a
traversal and nothing else. Note the compare is `cmplwi`, unsigned — `next` is
an address, and addresses don't go negative.

The `b check` before the loop label isn't a mistake. MWCC builds `while` as a
bottom-tested loop, so control jumps to the condition first and the body
follows. Plain `while` in C gives exactly this; `do`/`while` would be one step
too far.

## Your task

Using the `Node` struct provided, write `func_80142154` to reproduce the target
assembly.

<!-- solution -->
```c
Node* func_80142154(Node* n) {
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
