---
id: 308eac39-d440-4e9f-86db-84a4a408ab69
slug: control-bool-ne
title: Inequality as a Value
difficulty: 3
concepts:
  - booleans
  - compare
  - fingerprints
symbol: func_80023ab0
hints:
  - "The same xor \"difference detector\" as the last lesson, but the finishing instruction is `sltu zero, …`. It asks \"is zero less than it?\", which tests whether the value is nonzero."
  - "One `!=` in C. The compiler picks the right finishing instruction on its own."
---

# The other finishing instruction

Inequality works like equality. `!=` starts with the same XOR "difference
detector", but its finishing instruction must ask the opposite question: "is
the difference *nonzero*?". You already met that instruction when you tested a
bit:

```asm
sltu v0, zero, a0   # 0 < x (unsigned)? gives 1 for any nonzero x
jr   ra
nop
```

That is the whole of `return x != 0;`. "Zero is less than x, unsigned" is true
for every value except zero itself. Put the XOR in front and you get `!=` for
two values: the difference first, then the nonzero test. Here are the two
finishing instructions side by side:

- **`sltiu d, s, 1`** means "s == 0" and ends an **equality**.
- **`sltu d, zero, s`** means "s != 0" and ends an **inequality**.

Both rely on an unsigned comparison close to zero, the lowest unsigned value.
You can tell them apart at a glance: `==` puts the **1 in the immediate**, and
`!=` puts **`zero` in the middle operand**. Neither line makes sense by
itself. When you see either one, look one line up for the `xor`/`xori` (or
other value) that feeds it, and read the two lines as one C comparison.

The target computes a `!=` as a value. You know both halves, so write the one
line of C that produces them.

## Your task

Write `func_80023ab0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80023ab0(s32 a, s32 b) {
    return a != b;
}
```
