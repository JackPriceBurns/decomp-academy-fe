---
id: mastery-blend-accumulate
title: "Declaration Order Is Register Order: Coloring Saved Regs by Hand"
difficulty: 5
concepts:
  - register-allocation
  - saved-registers
  - declaration-order
  - loops
  - calls
symbol: blend_accumulate
hints:
  - All three sums are read *after* the loop and updated *across* a `sample()`
    call, so each one is forced into a callee-saved register (r28–r30). That's
    the precondition for the lever — a value only gets a saved reg if it's live
    across a call.
  - Saved registers are handed out r31, r30, r29… in *creation* order, and when
    several locals are first set at the same point (the `for (i=0, a=0, b=0,
    c=0; …)` comma-init) the tie-break is **declaration order**. So decl order
    literally chooses the registers.
  - The starter declares `a, b, c` and colors them r30/r29/r28 — backwards from
    the target. Reverse the three accumulator declarations to `c, b, a` (keep
    `i` last) and the homes become a→r28, b→r29, c→r30, matching every `add` and
    tail `mr`.
---

# The order you *declare* locals is the order they get colored

This is the lever behind SFA's `modelWalkAnimFn_800248b8` match — the commit whose
entire diff was **four local declarations, reversed**
(`blendChan, animChan, i, m` → `m, i, animChan, blendChan`), nudging the score
from 88.30 to 88.37 without touching a single line of logic. No casts, no pragmas,
no restructuring: just decl order. It is the purest demonstration that register
allocation in MWCC is *positional*, not semantic.

```c
extern int sample(int* p);
extern void emit(int slot, int v);
```

Here is the rule, straight from the decompiled allocator. A value is put in a
**callee-saved** register (r31, r30, r29 …) only when it must stay live across a
function call — that is the only time the allocator's "volatiles only" mask runs
dry and it falls back to the saved pool. And it hands those saved registers out
in a fixed sequence — **r31 first, then r30, then r29** — in the order the values
are *created*. Whoever is created first gets r31; the next gets r30; and so on.

The subtle part: "creation order" is usually decided by the front-end, **not** by
where you write your `int x;`. But there's an exception, and it's the one this
function lives in. When several values are **first defined at the same program
point** — a comma-init `for (i=0, a=0, b=0, c=0; …)`, or a run of
`a=0; b=0; c=0;` — their definition order *ties*, and MWCC breaks the tie by
**declaration order**. That is the seam `modelWalkAnimFn` reordered.

To see the effect concretely, consider a simpler two-accumulator analogue —
`score_blend`, which keeps sums `x` and `y` and emits them to slots 50 and 51.
Declared `y, x` (reverse of use order), both are live across `sample()` calls,
so the allocator uses saved registers. Both are first defined at the same program
point, so declaration order breaks the tie: `y` (declared first) claims r30, and
`x` (declared second) gets r29:

```asm
li    r28, 0             # i -> r28 (declared last, created at same point)
li    r29, 0             # x -> r29
li    r30, 0             # y -> r30  (declared first among y, x)
mr    r3, r31
bl    @sample
add   r29, r29, r3       # x += sample(base + i)
addi  r3, r31, 4
bl    @sample
add   r30, r30, r3       # y += sample(base + i + 1)
...
mr    r4, r29            # emit(50, x)
li    r3, 50
bl    @emit
mr    r4, r30            # emit(51, y)
li    r3, 51
bl    @emit
```

Flip the declarations to `x, y` and the homes swap: `x→r30, y→r29`. Every `add`
and `mr r4` in the function flips and the match breaks. The register numbers are
a direct readout of the order in which you spelled the declarations.

The target `blend_accumulate` has three accumulators (`a`, `b`, `c`) instead of
two. Apply the same rule: read the target assembly to find which accumulator lands
in which saved register, then work backwards to the declaration order that places
them there.

## Your task

With the externs above, write `blend_accumulate(int* base, int count)`. The logic
is in the starter and the assembly above: loop `i` over `[0, count)`, accumulate
three sums per iteration and `emit` the combined total, then emit each sum after
the loop. The challenge is register assignment: read the `li r28`, `li r29`,
`li r30` init sequence and the `mr r4, rX` tail to identify which accumulator
(`a`, `b`, or `c`) lands in which register, then order your declarations so MWCC
assigns those homes. The starter's declaration order produces the wrong assignment;
adjust it until the register layout matches.

<!-- starter -->
```c
void blend_accumulate(int* base, int count) {
    int a;
    int b;
    int c;
    int i;
    for (i = 0, a = 0, b = 0, c = 0; i < count; i++) {
        a += sample(base + i);
        b += sample(base + i + 1);
        c += sample(base + i + 2);
        emit(i, a + b + c);
    }
    emit(100, a);
    emit(101, b);
    emit(102, c);
}
```

<!-- solution -->
```c
void blend_accumulate(int* base, int count) {
    int c;
    int b;
    int a;
    int i;
    for (i = 0, a = 0, b = 0, c = 0; i < count; i++) {
        a += sample(base + i);
        b += sample(base + i + 1);
        c += sample(base + i + 2);
        emit(i, a + b + c);
    }
    emit(100, a);
    emit(101, b);
    emit(102, c);
}
```

<!-- context -->
```c
extern int sample(int* p);
extern void emit(int slot, int v);
```
