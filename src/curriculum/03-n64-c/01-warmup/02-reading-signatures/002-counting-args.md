---
id: 632d56ac-a96f-4c8f-b054-5518db6150f2
slug: signatures-counting-args
title: Counting the Arguments
difficulty: 1
concepts:
  - calling-convention
  - registers
  - arguments
concept: true
---

# Where the arguments live

The N64 ABI hands a function its first four integer arguments in the registers
**`a0, a1, a2, a3`** — in that order. The first argument is in `a0`, the second
in `a1`, and so on. (A fifth argument and beyond ride the stack; that's a later
tier's problem.) The result comes back in `v0`, which is why every exercise so
far has ended by landing its answer there.

That fixed mapping is the whole trick: if you can see which registers a function
reads, you know which arguments it has.

## Counting from the assembly

Here is a function that adds its second and fourth arguments together:

```asm
sw   a0, 0(sp)
sw   a2, 8(sp)
addu v0, a1, a3
jr   ra
nop
```

Read the `addu`'s two source registers: `a1` and `a3`. By the mapping, `a1` is
the **2nd** argument and `a3` is the **4th**. So this function takes four integer
arguments, and the C that produced it was:

```c
s32 combine(s32 a, s32 b, s32 c, s32 d) {
    return b + d;
}
```

But what about those two `sw` lines? That's `a` and `c` — the arguments the body
never touches. On many compilers an unused argument generates no code at all and
you'd have to *deduce* it from the gap. Not IDO. IDO **parks every unused
argument in its reserved stack slot** — the first argument's slot is `0(sp)`,
the second's `4(sp)`, the third's `8(sp)`, the fourth's `12(sp)`. So
`sw a0, 0(sp)` reads as "the 1st argument arrives and is never used", and
`sw a2, 8(sp)` says the same about the 3rd.

That's the favor from last lesson: on this compiler, **every argument announces
itself.** The ones the function uses show up doing work; the ones it ignores show
up being parked. Nothing hides.

## The rule

> Walk the body and list every argument you see — working registers in the code,
> plus one parked argument per `sw` at the top (its slot names its position).
> The highest position on either list is your argument count. Declare every
> argument up to it.

A lone `a0` doing work and no parking → one argument. An `addu` on `a0` and `a2`
plus a `sw a1, 4(sp)` → three. Work out that number, give each parameter the
type `s32`, return an `s32`, and the signature is reconstructed.
