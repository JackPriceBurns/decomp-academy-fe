---
id: d56391ae-6f66-4f53-8a7f-365fb19ce976
slug: abi-arg-homing
title: "Homing: The Four Shadow Slots"
difficulty: 2
concepts:
  - abi
  - homing
  - arguments
symbol: func_80158e44
hints:
  - "Three arguments get homed and one doesn't. The one that doesn't is the one the function actually uses."
  - "Match each `sw` offset to its register — 0 is a0's slot, 4 is a1's, 8 is a2's, 12 is a3's — and the `or` names the survivor."
---

# Those first sixteen bytes, explained at last

Twice now you've brushed against the reserved slots at `0(sp)`–`12(sp)`. Here's
the full story. o32 requires every caller to set aside four words at the bottom
of its outgoing argument area — one **home slot** per argument register, `a0`'s
at offset 0, `a1`'s at 4, `a2`'s at 8, `a3`'s at 12. They exist so register
arguments have a natural address to be spilled to, and at this compiler's
settings, IDO *uses* them, visibly.

The rule of thumb: **an argument that arrives in a register but isn't a plain,
fully-used word gets stored — "homed" — into its slot at the top of the
function.** The everyday case is an argument the function ignores. Here's
`pickLast(a, b, c)`, which returns only its third argument:

```asm
sw    a0, 0(sp)     # a: unused, homed to a0's slot
sw    a1, 4(sp)     # b: unused, homed to a1's slot
or    v0, a2, zero  # c: used — no store, just returned
jr    ra
nop
```

Nothing in the C *asks* for those stores. They're pure compiler fingerprint —
this game was built with debugging support kept on, and homing guarantees a
debugger can always find every argument in memory. For you, the stores are
information: **each homed register is an argument your C must declare and then
not use** (or not use as a plain word — narrow and 64-bit arguments get homed
too; both get their own lessons). Delete the parameter from your prototype and
the `sw` disappears; your match breaks in both directions.

Notice this is still a leaf — no frame. The positive offsets reach up into the
*caller's* frame, where the caller reserved these slots. That's also why a
five-argument callee finds its fifth argument at `16(sp)`: it's the next word
past the four homes.

The target uses only one of its arguments. Count the stores.

## Your task

Write `func_80158e44` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80158e44(s32 a, s32 b, s32 c, s32 d) {
    return b;
}
```
