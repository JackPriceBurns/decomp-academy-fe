---
id: 3c9e220d-bd2e-415f-aef4-67919480ee53
slug: structs-next-chase
title: "Chasing next"
difficulty: 4
concepts:
  - structs
  - pointers
  - loops
  - branch-likely
symbol: func_80327888
hints:
  - "Same walk as the worked example, but carrying a counter — watch what the guard's delay slot initializes and what increments inside the loop."
  - "The C is the classic `while (p != NULL) { p = p->next; n++; }` length count. The peeled first step and the cloned slot load are IDO's doing, not yours."
---

# p = p->next

A linked list is a struct whose field points at another of the same
struct, and walking it is one load in a loop: `p = p->next` compiles
to `lw p, next-offset(p)` — the pointer register reloading *itself
through itself*. Here's `last_link`, which chases to the end of a
chain:

```c
typedef struct Link Link;
struct Link {
    s32 id;       // offset 0
    Link *next;   // offset 4
};

Link *last_link(Link *k) {
    while (k->next != NULL) {
        k = k->next;
    }
    return k;
}
```

```asm
 0:  lw    v0, 4(a0)      # k->next — read one step ahead
 4:  beqzl v0, 0x20       # already the last node? return…
 8:  or    v0, a0, zero   # (likely slot) …k itself
 c:  or    a0, v0, zero   # ── loop: k = the next we peeked
10:  lw    v0, 4(v0)      # peek the following node
14:  bnezl v0, 0x10       # not the end? go around…
18:  or    a0, v0, zero   # (likely slot) …k = next again
1c:  or    v0, a0, zero
20:  jr    ra
24:  nop
```

This is the walk-until-zero schedule from the loops chapter wearing a
struct: the *tested* value is always one `lw 4(…)` ahead of the
variable, the first test is peeled off before the loop, and the
back-edge's likely slot carries the `k = next` step. A self-feeding
`lw` at a fixed offset is the entire fingerprint — offset 4 names
which field is `next`, and the struct below confirms it.

The target walks the same `Node` chain but *counts* the hops,
returning the length — the counter threads through the delay slots
exactly the way accumulators always have.

## Your task

Write `func_80327888` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80327888(Node *p) {
    s32 n = 0;
    while (p != NULL) {
        p = p->next;
        n++;
    }
    return n;
}
```

<!-- context -->
```c
typedef struct Node Node;
struct Node {
    s32 val;
    Node *next;
};
```
