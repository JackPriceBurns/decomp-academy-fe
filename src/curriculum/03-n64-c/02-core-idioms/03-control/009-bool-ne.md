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
  - "Same xor difference-detector as last lesson, but the finisher is `sltu zero, …` — \"is zero less than it?\" — which answers nonzero-ness."
  - "One `!=` in C. The compiler picks the right finisher on its own."
---

# The other finisher

Equality's twin. `!=` starts from the same difference-detector — XOR — but
needs the opposite finisher: not "is the difference zero?" but "is it
*nonzero*?". You've already met that move, back when you tested a bit:

```asm
sltu v0, zero, a0   # 0 < x (unsigned)? — 1 for any nonzero x
jr   ra
nop
```

That's the whole of `return x != 0;` — "zero is unsigned-less-than x" is
true for every value except zero itself. Bolt the XOR on the front and you
get `!=` for two values: difference first, nonzero-test second. The pair of
finishers side by side:

- **`sltiu d, s, 1`** — "s == 0" — closes an **equality**.
- **`sltu d, zero, s`** — "s != 0" — closes an **inequality**.

Both lean on unsigned comparison against the edge of the number line, and
they're easy to tell apart at a glance: `==` puts the **1 in the immediate**,
`!=` puts **`zero` in the middle operand**. Neither line makes sense alone —
when you spot either one, look up a line for the `xor`/`xori` (or other
value) feeding it, and read the two lines as a single C comparison.

The target materializes `!=` between its two arguments. You know both
halves; write the one-line C that summons them.

## Your task

Write `func_80023ab0` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80023ab0(s32 a, s32 b) {
    return a != b;
}
```
