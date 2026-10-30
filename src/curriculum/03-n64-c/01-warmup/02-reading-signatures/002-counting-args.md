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

The N64 ABI passes the first four integer arguments of a function in the
registers **`a0, a1, a2, a3`**, in that order. The first argument is in `a0`,
the second in `a1`, and so on. (The fifth argument and any after it are passed
on the stack. A later tier covers that.) The result comes back in `v0`. That is
why every exercise so far has ended by putting its answer there.

This mapping is fixed. So if you can see which registers a function reads, you
know which arguments it has.

## Counting from the assembly

Here is a function that adds its second and fourth arguments together:

```asm
sw   a0, 0(sp)
sw   a2, 8(sp)
addu v0, a1, a3
jr   ra
nop
```

Look at the two source registers of the `addu`: `a1` and `a3`. By the mapping,
`a1` is the **2nd** argument and `a3` is the **4th**. So this function takes
four integer arguments. This is the C that produced it:

```c
s32 combine(s32 a, s32 b, s32 c, s32 d) {
    return b + d;
}
```

The two `sw` lines are for `a` and `c`, the arguments that the body never uses.
On many compilers, an unused argument produces no code at all, and you would
have to *deduce* it from the gap in the registers. IDO is different. IDO
**parks every unused argument in its reserved stack slot**, which means it
stores the register there even though nothing reads it later. The first
argument's slot is `0(sp)`, the second's is `4(sp)`, the third's is `8(sp)` and
the fourth's is `12(sp)`. So `sw a0, 0(sp)` means "the 1st argument arrives and
is never used", and `sw a2, 8(sp)` means the same for the 3rd.

This is the favor the last lesson mentioned. On this compiler, **every argument
shows up in the code.** The arguments the function uses appear in the
instructions that do the work. The ones it ignores appear as parking stores.
None of them are hidden.

## The rule

> Go through the body and make two lists. The first is the argument registers
> that the code works with. The second has one parked argument for each `sw` at
> the top (its slot gives its position). The highest position on either list is
> your argument count. Declare every argument up to that position.

If only `a0` does work and nothing is parked, there is one argument. If an
`addu` uses `a0` and `a2`, and there is also a `sw a1, 4(sp)`, there are three.
Work out that number, give each parameter the type `s32`, return an `s32`, and
you have the signature.
