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
  - "This is the same walk as the worked example, with a counter added. Look at what the guard's delay slot initializes and what is incremented inside the loop."
  - "The C is the standard `while (p != NULL) { p = p->next; n++; }` length count. IDO adds the peeled first step and the cloned slot load by itself. You do not write them."
---

# p = p->next

A linked list is made of structs, and each one has a field that points to
another struct of the same type. Walking the list is one load in a loop.
`p = p->next` compiles to `lw p, next-offset(p)`, so the pointer register is
both the base of the load and its destination. Here is `last_link`, which
follows a chain to its end:

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
 0:  lw    v0, 4(a0)      # k->next, read one step ahead
 4:  beqzl v0, 0x20       # already the last node? return…
 8:  or    v0, a0, zero   # (likely slot) …k itself
 c:  or    a0, v0, zero   # loop: k = the next we peeked
10:  lw    v0, 4(v0)      # peek the following node
14:  bnezl v0, 0x10       # not the end? go around…
18:  or    a0, v0, zero   # (likely slot) …k = next again
1c:  or    v0, a0, zero
20:  jr    ra
24:  nop
```

This is the walk-until-zero schedule from the loops chapter, applied to a
struct. The *tested* value is always one `lw 4(…)` ahead of the variable. The
first test is peeled off and placed before the loop. The likely slot of the
back-edge holds the `k = next` step. An `lw` at a fixed offset that feeds its
own base register is all you need to spot the pattern. Offset 4 tells you
which field is `next`, and the struct below confirms it.

The target walks a `Node` chain in the same way, but it *counts* the steps and
returns the length. The counter moves through the delay slots just as
accumulators always have.

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
