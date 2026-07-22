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
symbol: List_last
hints:
  - Loop `while (n->next != NULL) n = n->next;` and return `n`.
  - Each step reloads `lwz r0, 0(r3)` and tests it with `cmplwi r0, 0`.
---

# p = p->next

A struct can hold a pointer to its own type. That's all a linked list really is,
each node knowing where the next one lives. So to land on the final node, you
walk. Loop over the chain, and every time around grab `next` from memory again
before you test it for NULL. Skip the re-fetch and the loop never advances; you'd
read the same node until the heat death of the console.

```c
typedef struct Node { struct Node* next; int value; } Node;
```

`next` comes first in the struct, offset 0, so following it is a lone
`lwz r0, 0(r3)`. Then zero-compare the result. Nonzero, keep walking. Zero,
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
traversal and nothing else. Worth a glance: the compare is `cmplwi`, unsigned.
`next` is an address, and addresses don't go negative.

That `b check` sitting before the loop label isn't a mistake. MWCC builds the
`while` as a bottom-tested loop, so control jumps to the condition first and the
body folds in next to it. Plain old `while` in C gives you this exact thing.
Reach for `do`/`while` and you've gone one step too far.

## Your task

With `Node` above, write `List_last` that follows `next` until it is NULL and
returns the final node.

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
