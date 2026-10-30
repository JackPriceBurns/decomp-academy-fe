---
id: e885b348-660f-4fb4-b70c-2b0692766259
slug: gba-globals-const-table
title: A Constant Table
difficulty: 4
concepts:
  - globals
  - constants
  - arrays
symbol: func_083518c4
hints:
  - Only one of the two objects in the context can produce a pool word. The
    other one can only show up as arithmetic.
  - "It takes an `s32` and returns an `s32`. `lsl r0, r1, #2 / add r0, r1` multiplies `r1` by five, and the table element is the value being multiplied."
---

# A constant scalar becomes an immediate

The compiler replaces a `const` scalar at file scope with an immediate wherever
it is used. It has no address in the listing, no pool word and no load:

```asm
0        mov       r0, #3
2        bx        lr
```

That is a function returning a named `const s32` whose value is 3. It is
byte-identical to a function returning the literal `3`, and nothing in the
assembly tells you which one the source used. When you see a small immediate
in a real target, it might have been a named constant. You can always guess
that, but you can never prove it.

A `const` array is handled differently. It keeps its storage and its symbol,
and the code reads it through the pool like any other global. This happens
even when the index is a compile-time constant:

```asm
0        ldr       r0, [pc, #4] (->8)
2        ldr       r0, [r0, #8]
4        bx        lr
6        .hword    0
8        .word     kBonus
```

The compiler knows the address, the index and every value in the initialiser,
but it still emits the load. gcc 2.9 folds constant scalars but does not fold
table lookups. So a `const` table is as visible in the assembly as a table that
can change.

Together, those two facts give you a useful rule for reading listings. A
`.word` row pointing at .rodata means a real table exists in the source. An
unexplained immediate in the middle of an expression may be a named constant or
a literal, and the listing cannot tell you which.

Your target uses one of each.

## Your task

Write `func_083518c4` to reproduce the target assembly.

<!-- context -->
```c
const s32 kDamage[8] = {2, 4, 6, 8, 10, 12, 14, 16};
const s32 kCrit = 5;
```

<!-- solution -->
```c
s32 func_083518c4(s32 i) {
    return kDamage[i] * kCrit;
}
```
