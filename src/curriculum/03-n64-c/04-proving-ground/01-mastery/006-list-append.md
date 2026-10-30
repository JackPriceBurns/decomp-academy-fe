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
  - "There are three places where an `addu` is followed by a memory operation. Check the operand order of each `addu` against the two macros. Exactly one of them, inside the walk loop, uses the reversed form."
  - "Shape: if the list is empty, head = node. Otherwise, walk to the last node with the `bnezl` loop and attach the new node to it. In both cases the new node's own next becomes null and the count is incremented."
---

# The developers wrote it both ways

`func_801cdf70` walks to the end of the intrusive list from lesson 002 and
attaches a new node there. You have written this kind of pointer walk before:
`lw`, a test, then `bnezl` back to the top. The new part is harder to spot, and
it matters only for matching.

The node plus offset address you learned compiles to an `addu`. Addition is
commutative, so the original programmer could write `node + offset` or
`offset + node`. In this function's source **they did both**, in different
places. IDO keeps the source order of `+` operands. Here are two functions that
differ only in that order:

```asm
lh   t6, 2(a0)        # c->linkOffset
addu t7, a1, t6       # node + offset: node on the left
lw   v0, 0(t7)
jr   ra
nop
```

```asm
lh   t6, 2(a0)        # c->linkOffset
addu t7, t6, a1       # offset + node: the SAME address, flipped encoding
lw   v0, 0(t7)
jr   ra
nop
```

Both compute the same address, but the instruction bytes differ. The diff
compares bytes.

This is why the context gives you *two* macros. `LINKED_LIST_NEXT_FIELD` puts
the node first in the add, and `LINKED_LIST_NEXT_FIELD2` puts the offset first.
The second one exists only because the original source wrote the expression
that way in some places. The real header says this in a comment. At each `addu`
in the target, read the operand order and pick the macro that produces it.

The rest of the function uses material from tier 2: a special case for a null
head, a walk loop whose `bnezl` runs its delay slot only when the loop
continues, attaching the new node to the last one, a null store into the new
node, and the count increment. Work through the branches one at a time.

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
