---
id: d32c18fa-8095-49ad-8dfc-8260547d243b
slug: mastery-list-prepend
title: "The Intrusive List: Prepend"
difficulty: 2
concepts:
  - real-code
  - pointers
  - structs
symbol: func_800cb060
hints:
  - "Use the `LINKED_LIST_NEXT_FIELD` macro from the context for the `addu`-then-`sw` pair; the value stored through it is whatever `lw` pulled out of the list first."
  - "The `lw` from `4(a0)` happens before the `sw` to `4(a0)` — old head out, new head in, in that order. The final `lh`/`addiu`/`sh` trio is the count."
---

# A list that can chain anything

This linked list doesn't wrap its elements in node structs. Instead, any struct
can *be* a node: the list header just records **where inside each element the
"next" pointer lives**, as a byte offset. One list type, reused for every kind
of object in the game — at the price of some pointer arithmetic on every
operation.

That arithmetic is the new read. The offset isn't a constant baked into a load
— it's *data*, loaded from the header at runtime, then added to a node
pointer. Here's `setHp`, which uses the same trick to store a stat into an
animal at a per-species offset:

```asm
lh   t6, 2(a0)      # sp->hpOffset — the offset is DATA, loaded like any field
addu t7, a1, t6     # animal + offset = the address OF the hp field
sw   a2, 0(t7)      # store through it, displacement 0
jr   ra
nop
```

`lh`, `addu`, then a memory op at `0(...)` — that triple is the fingerprint of
a runtime-computed field address. In C it's a cast dance:
`*(s32 *)((u32)animal + sp->hpOffset)`. The list header's version of that
expression is wrapped in a macro for you in the context, exactly as the
original source has it.

The target is `func_800cb060`: push a node on the front. Four memory
writes' worth of bookkeeping — study which value each store carries. Note the
scheduler hoisted the offset load to the very top, above the head swap it
belongs after; by now that shouldn't slow you down.

## Your task

Write `func_800cb060` to reproduce the target assembly.

<!-- solution -->
```c
void func_800cb060(LinkedList *list, void *node) {
    void *prevHead;

    prevHead = list->head;
    list->head = node;

    *LINKED_LIST_NEXT_FIELD(list, node) = prevHead;

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
```
