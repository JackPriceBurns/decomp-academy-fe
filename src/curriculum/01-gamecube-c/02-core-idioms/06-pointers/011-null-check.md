---
id: 63c9f3b1-d900-5d8b-9053-50fc3af2d129
slug: pointers-null-check
title: Guarding Against NULL
difficulty: 4
concepts:
  - pointers
  - branches
  - "null"
symbol: safe_deref
hints:
  - "`if (p)` is an unsigned compare of the pointer against 0."
  - Expect `cmplwi r3, 0` / `beq-` guarding the `lwz`.
---

# Branch on the pointer itself

NULL is just address `0`. So `if (p)` and `if (p != NULL)` come out identical,
both an unsigned compare of the pointer register against `0`. MWCC reaches for
`cmplwi` (compare logical word immediate) instead of `cmpwi`, since an address is
an unsigned quantity.

Don't read the `-` and `+` on a branch as part of the condition. They're static
prediction bits, encoded into the branch itself. A `beq-` says branch if equal,
but I'm betting you won't. A `bne+` says branch if not equal, and I'm betting you
will. NULL guards almost never trip, so the branch taken on NULL gets stamped with
the `-`. Two `blr`s show up as well, since each return path finishes on its own.

Here's that pattern wrapped around a `u32*` load:

```c
u32 safe_read_u32(u32* p) {
    if (p) {
        return *p;
    }
    return 0;
}
```

```asm
cmplwi  r3,0
beq-    10 <safe_read_u32+0x10>
lwz     r3,0(r3)
blr
li      r3,0
blr
```

When `p` is zero the `beq-` hops over the load. Count the `blr`s, there are two,
one for each way out. Now do the same for a function guarding an `int*` load.

## Your task

Write `safe_deref`, taking an `int* p`, returning `*p` when `p` is non-NULL and
`0` otherwise.

<!-- solution -->
```c
int safe_deref(int* p) {
    if (p) {
        return *p;
    }
    return 0;
}
```
