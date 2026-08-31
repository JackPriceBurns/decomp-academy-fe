---
id: 0737dc92-93cb-4d4a-8ed7-d514c7a38266
slug: mastery-list-append
title: Append, and the Order of an Add
difficulty: 3
concepts:
  - real-code
  - pointers
  - loops
  - operand-order
symbol: func_801cdf70
hints:
  - "Three `addu`-then-memory-op sites. Check each `addu`'s operand order against the two macros — exactly one site inside the walk loop uses the reversed form."
  - "Shape: empty list → head = node; otherwise walk to the last node with the
    `bnezl` loop and hook the new node on. Either way the node's own next
    becomes null and the count bumps."
---

# The devs typed it both ways

`func_801cdf70` walks to the end of the intrusive list from lesson 002 and
hooks a new node on. The walk is a pointer chase you've done before — `lw`,
test, `bnezl` back around. What's new is subtler, and it's a pure matching
lesson.

The node-plus-offset address you learned comes out as an `addu`. Addition
commutes, so the original programmer could write `node + offset` or
`offset + node` — and in this function's source, **they did both**, in
different spots. IDO keeps the source order of `+` operands. Two functions,
identical except for the flip:

```asm
lh   t6, 2(a0)        # c->linkOffset
addu t7, a1, t6       # node + offset — node on the left
lw   v0, 0(t7)
jr   ra
nop
```

```asm
lh   t6, 2(a0)        # c->linkOffset
addu t7, t6, a1       # offset + node — the SAME address, flipped encoding
lw   v0, 0(t7)
jr   ra
nop
```

Same math, different bytes. The diff compares bytes.

This is why the context gives you *two* macros: `LINKED_LIST_NEXT_FIELD` adds
node-first, `LINKED_LIST_NEXT_FIELD2` adds offset-first. The second exists for
no reason except that the original source typed the expression that way in some
places — the real header says exactly that in a comment. Your job at each of
the target's `addu` sites: read the operand order, pick the macro that produces
it.

Beyond that, the function is tier-2 material: a null-head special case, a walk
loop whose `bnezl` re-runs its slot only when continuing, a trailing-node
hookup, a null store into the new node, and the count bump. Take the branches
one at a time.

## Your task

Write `func_801cdf70` to reproduce the target assembly.

<!-- solution -->
```c
void func_801cdf70(LinkedList *list, void *node) {
    void *next;
    void *last;

    if (list->head == NULL) {
        list->head = node;
    } else {
        next = list->head;
        last = next;

        while (next != NULL) {
            last = next;
            next = *LINKED_LIST_NEXT_FIELD2(list, last);
        }

        *LINKED_LIST_NEXT_FIELD(list, last) = node;
    }

    *LINKED_LIST_NEXT_FIELD(list, node) = NULL;

    list->count += 1;
}
```

<!-- context -->
```c
typedef struct {
    /*00*/ s16 count;
    /*02*/ s16 nextFieldOffset;
    /*04*/ void *head;
} LinkedList;

/* Pointer to a node's "next" field, which lives nextFieldOffset bytes in. */
#define LINKED_LIST_NEXT_FIELD(list, node) ((void **)((u32)node + list->nextFieldOffset))
/* Same address with the add written the other way around. It exists only to
   match code — the original source typed this expression both ways. */
#define LINKED_LIST_NEXT_FIELD2(list, node) ((void **)(list->nextFieldOffset + (u32)node))
```
