---
id: pointers-null-check
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

A NULL check tests the pointer against zero before dereferencing. Since NULL is
address `0`, `if (p)` is an unsigned compare against `0` feeding a branch. When
it's zero, the function skips the load and returns `0`:

```asm
cmplwi r3, 0          # p == NULL ?
beq-   ret0           # if so, jump to the zero return
lwz    r3, 0(r3)      # else *p
blr
ret0:
li     r3, 0          # return 0
blr
```

The `beq-` carries a branch hint (the `-`) predicting the pointer is usually
*non*-NULL — MWCC assumes the early-out is the rare path. The `-`/`+` suffix is
a static prediction bit baked into the branch's encoding, not a condition
modifier: `-` marks the branch as *unlikely* taken, `+` as *likely*. You'll see
`bne+`, `blt+`, `beq-` and friends throughout real disassembly. Two `blr`s,
one per return path.

## Your task

Write `safe_deref`, taking an `int* p`, returning `*p` when `p` is non-NULL and
`0` otherwise.

<!-- starter -->
```c
int safe_deref(int* p) {
    return 0;
}
```

<!-- solution -->
```c
int safe_deref(int* p) {
    if (p) {
        return *p;
    }
    return 0;
}
```
