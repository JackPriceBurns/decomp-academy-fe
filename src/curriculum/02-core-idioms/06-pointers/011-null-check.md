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

NULL is address `0`, so `if (p)` and `if (p != NULL)` both compile to an
unsigned compare of the pointer register against `0`. MWCC uses `cmplwi` (compare
logical word immediate — unsigned) rather than `cmpwi` because addresses are
unsigned quantities.

The branch hint suffixes `-` and `+` are static prediction bits baked into the
branch encoding, not condition modifiers. `beq-` means "branch if equal, predicted
*unlikely*". `bne+` means "branch if not equal, predicted *likely*". In a NULL
guard the early-out path is expected to be rare, so the taken-when-NULL branch
gets a `-`. Two `blr` instructions appear because each return path ends
independently.

Here is the same pattern guarding a `u32*` load:

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

The `beq-` jumps over the load when `p` is zero. Notice there are two `blr`
instructions — one per return path. Now apply the same logic to a function that
guards an `int*` load.

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
