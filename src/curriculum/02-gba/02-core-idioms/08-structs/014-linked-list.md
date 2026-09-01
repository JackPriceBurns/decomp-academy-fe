---
id: 94af0a4e-648e-4917-ac9a-10a3314e0f84
slug: gba-structs-linked-list
title: Chasing a next Pointer
difficulty: 4
concepts:
  - structs
  - loops
  - pointers
hints:
  - A load whose result becomes the base of the next iteration's loads is a
    pointer field being followed. Its offset is where the link lives in the
    struct.
  - A `struct Node *` in, an `s32` out. The loop-carried pointer lives in `r1`
    and the running total in `r2`, and the `mov r0, r2` at the end is the
    return.
symbol: func_08276b90
---

# A pointer field is just a word

`n = n->next` compiles to a single load. The link field has an offset like any
other field, and the value it produces happens to be an address, so it becomes
the base register for the next iteration. Nothing marks it as a pointer; you
recognise it because the register it lands in is the one being dereferenced.

The loop around it has a shape worth learning. gcc turns a `while (p)` list walk
into a guard plus a bottom-tested loop: one `cmp`/`beq` before the body to skip
it entirely when the list is empty, then the body, then a `cmp`/`bne` at the
bottom that jumps back. The test appears twice in the assembly and once in the
C.

Here is a walk that counts nodes:

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
is the offset in that load — for this struct the pointer is the *second* field.
The counter is initialised before the guard, and the `mov r0, r1` after the loop
is the return value being moved into place.

A different loop shape means different C. When the condition has to be tested
before the pointer can advance, gcc rotates the loop and jumps into the middle
of it:

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

That is `while (it->link) it = it->link;` — the advance sits above the entry
point and the unconditional `b` skips over it on the way in. If your target
starts with a forward `b` into the body, do not try to reproduce it with a guard
`if`; write the plain `while` and let gcc rotate it.

Your target is the guarded shape, with something accumulating across iterations.
Two fields of the node are involved.

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
