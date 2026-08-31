---
id: 42819f51-0bf9-47bc-9a05-9fdf547a8488
slug: int64-truncation
title: "Truncation: The High Half Vanishes"
difficulty: 2
concepts:
  - int64
  - casts
  - truncation
symbol: func_800a067c
hints:
  - "Four words are homed but only two ever load back. Which two offsets?"
  - "One `addu` and no carry chain — the high half of the result is never computed. What return type makes it unnecessary?"
---

# Going the other way costs even less

Widening invents a high half; **truncating** an `s64` down to 32 bits just
*drops* one. And the compiler doesn't merely drop the register — it deletes
every instruction that only existed to produce it. Here's `lowWord(x)`,
which returns an `s64` as an `s32`:

```asm
sw     a0, 0(sp)      # both halves homed, as 64-bit arguments always are…
sw     a1, 4(sp)
lw     v0, 4(sp)      # …but only the LOW word ever comes back
jr     ra
nop
```

The homing stores still happen — that ritual is unconditional — but offset
0, the high half's home, is written once and never read. A homed slot that
nothing loads from is your signal: *this function only cares about the low
word*.

The deletion gets more dramatic when there's arithmetic involved. Recall
the full 64-bit add: low `addu`, `sltu` carry, two high `addu`s. Now ask
what happens if the result is immediately cast to `s32`. The carry chain
exists only to build the **high** word of the sum — and the cast throws
that word away. So the compiler doesn't build it. The entire chain
collapses to a single `addu` of the two low words, and the high halves of
both arguments become dead weight that's homed and forgotten.

That's the reading skill this lesson wants you to have: when a listing
takes 64-bit arguments but the body is suspiciously 32-bit — too few
loads, no carry logic, one result register instead of a pair — the C
almost certainly narrows the result. The work you *don't* see is the cast.

The target does arithmetic you've already learned to spot. Count its
loads.

## Your task

Write `func_800a067c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800a067c(s64 a, s64 b) {
    return (s32) (a + b);
}
```
