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
  - Only one of the two objects in the context is capable of producing a pool
    word; the other one can only show up as arithmetic.
  - "An `s32` in, an `s32` out. `lsl r0, r1, #2 / add r0, r1` multiplies r1 by five, and the table element is what gets multiplied."
---

# The constant that leaves no trace

A `const` scalar at file scope is folded into an immediate wherever it is used.
It has no address in the listing, no pool word, and no load:

```asm
0        mov       r0, #3
2        bx        lr
```

That is a function returning a named `const s32` whose value is 3. It is
byte-identical to a function returning the literal `3`, and no amount of staring
at the assembly will tell you which one the source said. When you meet a small
immediate in a real target, "this was a named constant" is always available as a
guess and never provable.

A `const` array behaves completely differently. It keeps its storage, keeps its
symbol, and is read through the pool like any other global — even when the index
is a compile-time constant:

```asm
0        ldr       r0, [pc, #4] (->8)
2        ldr       r0, [r0, #8]
4        bx        lr
6        .hword    0
8        .word     kBonus
```

The compiler knows the address, knows the index, and knows every value in the
initialiser, and it still emits the load. gcc 2.9 folds constant scalars and
declines to fold table lookups, so a `const` table is as visible in the assembly
as a mutable one.

Between those two facts you get a useful reading rule. A `.word` row pointing at
.rodata means a real table exists in the source; an unexplained immediate in the
middle of an expression may be a named constant and may be a literal, and the
listing genuinely cannot tell you.

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
