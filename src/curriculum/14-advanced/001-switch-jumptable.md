---
id: advanced-switch-jumptable
title: "Switch: The Jump Table"
difficulty: 3
concepts:
  - switch
  - jump-table
  - bctr
  - control-flow
symbol: dispatch
hints:
  - Eight consecutive cases (0..7) is dense enough that MWCC builds a jump
    table, not a compare chain.
  - Look for the `cmplwi r3, 7` bounds check then `lwzx` / `mtctr` / `bctr`
    dispatching through a @switch table.
---

# The other kind of switch

In the control chapter you met the **compare chain** — a cascade of `cmpwi` /
`beq-` / `bge-` that bisects a handful of cases. But when the cases are
**dense and numerous** (here `0..7`, all consecutive), MWCC stops comparing
one value at a time and builds a **computed jump**: it uses `x` itself as an
index into a table of code addresses.

```asm
cmplwi r3, 7        # bounds check: is x in 0..7?
bgt-   .default     # above the table -> default arm
lis    r4, table@ha # load the upper 16 bits of the @switch table address...
slwi   r0, r3, 2    # x * 4  (each table entry is a 4-byte address)
addi   r3, r4, table@lo # ...add the lower 16 bits -> r3 = full table base
lwzx   r0, r3, r0   # load table[x]  -> the target address
mtctr  r0           # move it into the count register
bctr                # branch to CTR  -> jump straight to case x
```

Three fingerprints give it away: the **single `cmplwi` bounds check** (note
`cmplwi`, unsigned — a negative `x` wraps to a huge value and fails the check
for free), the `slwi r0, r3, 2` index scaling, and the
`lwzx` → `mtctr` → `bctr` trio that loads an address from a `@switch` rodata
table and jumps through it. After `bctr`, each case is its own tiny
`li r3, N` / `blr` block. No per-case compares at all — the dispatch is O(1).

## Your task

Write `dispatch`: a `switch` on `x` with cases `0..7` returning
`100, 211, 322, 433, 544, 655, 766, 877` respectively, and `-1` by default.
Eight dense cases is past the threshold, so this compiles to the table form.

<!-- starter -->
```c
int dispatch(int x) {
    return 0;
}
```

<!-- solution -->
```c
int dispatch(int x) {
    switch (x) {
        case 0: return 100;
        case 1: return 211;
        case 2: return 322;
        case 3: return 433;
        case 4: return 544;
        case 5: return 655;
        case 6: return 766;
        case 7: return 877;
        default: return -1;
    }
}
```
