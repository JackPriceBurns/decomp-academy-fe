---
id: 94af0a4e-648e-4917-ac9a-10a3314e0f84
slug: gba-structs-linked-list
title: Following a next Pointer
difficulty: 4
concepts:
  - structs
  - loops
  - pointers
hints:
  - A load whose result becomes the base of the next iteration's loads is a
    pointer field being followed. Its offset is where the link is stored in the
    struct.
  - The function takes a `struct Node *` and returns an `s32`. The pointer
    carried from one iteration to the next is in `r1`, and the running total is
    in `r2`. The `mov r0, r2` at the end is the return.
symbol: func_08276b90
---

# A pointer field is a word like any other

`n = n->next` compiles to a single load. The link field has an offset like any
other field. The value it holds is an address, so after the load it becomes the
base register for the next iteration. Nothing marks the field as a pointer. You
can tell because the register it is loaded into is then used as the base for
other loads.

The loop around it has a pattern worth learning. gcc compiles a `while (p)`
list walk into a guard plus a loop that is tested at the bottom. A `cmp`/`beq`
before the body skips the loop completely when the list is empty. Then comes
the body, and then a `cmp`/`bne` at the bottom that jumps back. The test
appears twice in the assembly but only once in the C.

Here is a list walk that counts nodes:

```asm
0        mov       r1, #0
2        cmp       r0, #0
4        beq       14 ~>
6      ~>add       r1, #1
8        ldr       r0, [r0, #4]
10       cmp       r0, #0
12       bne       6 ~>
14     ~>mov       r0, r1
16       bx        lr
```

`struct Item { s32 cost; struct Item *link; }` puts the link at offset 4, which
is the offset in that load. For this struct, the pointer is the *second* field.
The counter is initialised before the guard, and the `mov r0, r1` after the
loop moves the return value into place.

A different loop pattern means different C. When the condition has to be
tested before the pointer can move forward, gcc rotates the loop and jumps into
the middle of it:

```asm
0        mov       r1, r0
2        b         6 ~>
4      ~>ldr       r1, [r1, #4]
6      ~>ldr       r0, [r1, #4]
8        cmp       r0, #0
10       bne       4 ~>
12       mov       r0, r1
14       bx        lr
```

That is `while (it->link) it = it->link;`. The step to the next node is placed
above the entry point, and the unconditional `b` skips over it the first time.
If your target starts with a forward `b` into the body, do not try to reproduce
it with a guard `if`. Write the plain `while` and let gcc rotate it.

Your target uses the guarded pattern, with a value that accumulates across the
iterations. Two fields of the node are involved.

## Your task

Write `func_08276b90` to reproduce the target assembly.

<!-- context -->
```c
struct Node { struct Node *next; s32 val; };
```

<!-- solution -->
```c
s32 func_08276b90(struct Node *n) {
    s32 s = 0;
    while (n) {
        s = s + n->val;
        n = n->next;
    }
    return s;
}
```
