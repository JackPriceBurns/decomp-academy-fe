---
id: 63c9f3b1-d900-5d8b-9053-50fc3af2d129
slug: pointers-null-check
title: Guarding Against NULL
difficulty: 4
concepts:
  - pointers
  - branches
  - "null"
symbol: func_800f27cc
hints:
  - "`if (p)` is an unsigned compare of the pointer against 0."
  - Expect `cmplwi r3, 0` / `beq-` guarding the `lwz`.
---

# Branch on the pointer itself

NULL is just address `0`. So `if (p)` and `if (p != NULL)` compile identically:
an unsigned compare of the pointer register against `0`. MWCC uses `cmplwi`
(compare logical word immediate) rather than `cmpwi`, since an address is
unsigned.

Don't read the `-` and `+` on a branch as part of the condition. They're static
prediction bits encoded into the branch itself. `beq-` means branch if equal,
but the compiler bets you won't; `bne+` means branch if not equal, and the
compiler bets you will. NULL guards almost never trip, so the taken-on-NULL
branch gets the `-`. Two `blr`s appear, one for each return path.

Here's that pattern around a `u32*` load:

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

When `p` is zero the `beq-` hops over the load. Count the `blr`s: two, one for
each path. Now do the same for a function guarding an `int*` load.

## Your task

Write `func_800f27cc` to reproduce the target assembly.

<!-- solution -->
```c
int func_800f27cc(int* p) {
    if (p) {
        return *p;
    }
    return 0;
}
```
