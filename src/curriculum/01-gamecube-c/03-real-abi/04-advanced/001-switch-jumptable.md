---
id: 0332bd9a-10da-5146-967c-52fd1499c954
slug: advanced-switch-jumptable
title: "Switch: The Jump Table"
difficulty: 3
concepts:
  - switch
  - jump-table
  - bctr
  - control-flow
symbol: func_800ccaf4
hints:
  - Eight consecutive cases (0..7) is dense enough that MWCC builds a jump
    table, not a compare chain.
  - Look for the `cmplwi r3, 7` bounds check then `lwzx` / `mtctr` / `bctr`
    dispatching through a @switch table.
---

# The other kind of switch

Back in the control chapter you saw the **compare chain**, a cascade of `cmpwi` /
`beq-` / `bge-` that narrows down a handful of cases. That breaks down once the
cases get **dense and numerous**. With `0..7` all in a row, MWCC quits testing
values one by one and reaches for a **computed jump** instead, treating `x` as a
straight index into a table of code addresses.

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

Three things give it away once you know to look. The bounds check is a **single
`cmplwi`**, and because `cmplwi` is unsigned, a negative `x` wraps round to some
enormous value and fails the check at no extra cost. The index gets scaled by
`slwi r0, r3, 2`. Then the `lwzx` → `mtctr` → `bctr` trio fetches an address from
a `@switch` rodata table and jumps through it. Everything after `bctr` is a small
`li r3, N` / `blr` block, one per case. There's no per-case compare; the
dispatch is O(1) flat.

## Your task

Write `dispatch(int x)`: a `switch` on `x` with eight consecutive cases and a
default. Read the `li r3, N` values in each case arm from the assembly above to
recover what each case returns. Eight dense cases is past the threshold, so this
compiles to the table form.

<!-- solution -->
```c
int func_800ccaf4(int x) {
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
