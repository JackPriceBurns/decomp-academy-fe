---
id: 42819f51-0bf9-47bc-9a05-9fdf547a8488
slug: int64-truncation
title: "Truncation: Dropping the High Half"
difficulty: 2
concepts:
  - int64
  - casts
  - truncation
symbol: func_800a067c
hints:
  - "Four words are homed, but only two are ever loaded back. Which two offsets are they?"
  - "There is one `addu` and no carry chain, because the high half of the result is never computed. What return type makes it unnecessary?"
---

# Going the other way costs even less

Widening creates a high half. **Truncating** an `s64` down to 32 bits
*drops* one. The compiler does more than ignore the register: it deletes every
instruction that existed only to produce it. Here is `lowWord(x)`, which
returns an `s64` as an `s32`:

```asm
sw     a0, 0(sp)      # both halves homed, as 64-bit arguments always are…
sw     a1, 4(sp)
lw     v0, 4(sp)      # …but only the LOW word is loaded back
jr     ra
nop
```

The homing stores still happen, because homing is unconditional. But offset 0,
the high half's home slot, is written once and never read. A homed slot that
nothing loads from is a clear signal: *this function only uses the low word*.

The effect is larger when the function does arithmetic. Recall the full 64-bit
add: a low `addu`, an `sltu` carry, and two high `addu`s. Subtraction has the
same shape, with a borrow in place of the carry. In both, the carry or borrow
logic exists only to build the **high** word of the result. If the result is
cast to `s32` straight away, the cast throws that word away, so the compiler
does not build it. The whole chain becomes a single instruction on the two low
words, and the high halves of the 64-bit operands are homed and then never
used.

This is the reading skill this lesson teaches. A listing may take 64-bit
arguments while the body looks 32-bit: too few loads, no carry logic, and one
result register instead of a pair. When you see that, the C almost certainly
narrows the result. The work you *don't* see is what tells you about the cast.

The target does arithmetic you have already learned to recognize. Count its
loads.

## Your task

Write `func_800a067c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800a067c(s64 a, s64 b) {
    return (s32) (a + b);
}
```
