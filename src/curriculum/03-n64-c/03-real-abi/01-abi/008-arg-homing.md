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
  - "Match each `sw` offset to its register: 0 is a0's slot, 4 is a1's, 8 is a2's and 12 is a3's. The `or` shows the one argument that is used."
---

# The first sixteen bytes, explained

Earlier lessons mentioned the reserved slots at `0(sp)` through `12(sp)`. This
lesson explains them. o32 requires every caller to set aside four words at the
bottom of its outgoing argument area. There is one **home slot** for each
argument register: `a0`'s slot is at offset 0, `a1`'s at 4, `a2`'s at 8 and
`a3`'s at 12. The slots give register arguments a fixed address to be spilled
to, and at this compiler's settings IDO *uses* them in a way you can see.

The rule of thumb: **an argument that arrives in a register gets stored
("homed") into its slot at the top of the function, unless it is a plain word
that the function uses.** The most common case is an argument that the
function ignores. This is `pickLast(a, b, c)`, which returns only its third
argument:

```asm
sw    a0, 0(sp)     # a: unused, homed to a0's slot
sw    a1, 4(sp)     # b: unused, homed to a1's slot
or    v0, a2, zero  # c: used, so no store; it is returned
jr    ra
nop
```

Nothing in the C *asks* for those stores. They come from how the game was
compiled. It was built with debugging support turned on, and homing makes sure
a debugger can always find every argument in memory. For you, the stores are
useful information: **each homed register is an argument that your C must
declare and then not use** (or not use as a plain word: narrow and 64-bit
arguments are homed too, and both have their own lessons). So the stores must
match exactly. If you delete the parameter from your prototype, the `sw`
disappears and the match breaks.

Notice that this is still a leaf, with no frame. The positive offsets point up
into the *caller's* frame, where the caller reserved these slots. This is also
why a callee with five arguments finds its fifth argument at `16(sp)`: it is
the next word after the four home slots.

The target uses only one of its arguments. Count the stores.

## Your task

Write `func_80158e44` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80158e44(s32 a, s32 b, s32 c, s32 d) {
    return b;
}
```
