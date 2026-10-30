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
  - "Use the `LINKED_LIST_NEXT_FIELD` macro from the context for the `addu` and `sw` pair. The value stored through it is the one that `lw` read from the list first."
  - "The `lw` from `4(a0)` happens before the `sw` to `4(a0)`: the old head is read out first, then the new head is written in. The final `lh`/`addiu`/`sh` group is the count."
---

# A list that can link any struct

This linked list does not wrap its elements in node structs. Any struct can
*be* a node. The list header records **where inside each element the "next"
pointer lives**, as a byte offset. The game uses this one list type for every
kind of object. The cost is some pointer arithmetic on every operation.

That arithmetic is the new thing to read. In this list the offset is *data*.
The code loads it from the header at runtime and then adds it to a node
pointer, so no load instruction holds it as a fixed displacement. Here is
`setHp`, which uses
the same method to store a stat into an animal at an offset that depends on
the species:

```asm
lh   t6, 2(a0)      # sp->hpOffset: the offset is DATA, loaded like any field
addu t7, a1, t6     # animal + offset = the address OF the hp field
sw   a2, 0(t7)      # store through it, displacement 0
jr   ra
nop
```

An `lh`, then an `addu`, then a memory operation at `0(...)`: this group of
three is the pattern for a field address computed at runtime. In C it needs
casts: `*(s32 *)((u32)animal + sp->hpOffset)`. The context gives you the list
header's version of that expression as a macro, written exactly as the
original source has it.

The target is `func_800cb060`, which pushes a node onto the front of the list.
The bookkeeping is about four memory writes, so check which value each store
carries. Note that the scheduler moved the offset load to the very top, above
the head swap, even though it belongs after the swap. You have seen this kind
of reordering before, so it should not slow you down.

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
