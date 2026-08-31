---
id: 8f47230c-b58f-4fc2-8ecd-c034bb02a75a
slug: signatures-arg-registers
title: Read an Argument Off the Registers
difficulty: 1
concepts:
  - calling-convention
  - registers
  - arguments
symbol: func_803d1c8c
hints:
  - "Arguments map to a0, a1, a2, a3 in order — read the `or`'s source register and count to find its position."
  - "Each `sw` at the top parks one unused argument in its own slot: 0(sp) is the first argument, 4(sp) the second, 8(sp) the third."
---

# Your first one from scratch

No starter this time — just an empty editor and the name `func_803d1c8c` up in the
header. Everything else you read off the target.

Look at it: some parking at the top, a single `or` into `v0`, then the return.
You know `or rd, rs, zero` from the warmup — it's MIPS's register copy — and
`v0` is the return register. So this function takes one of its arguments and
hands it right back, untouched. The only thing left to work out is *which*
argument.

That is pure register-counting. Take a function whose body is:

```asm
sw   a0, 0(sp)
sw   a1, 4(sp)
or   v0, a2, zero
jr   ra
nop
```

The copy's source is `a2`, the **3rd** argument register, so this returns its
third parameter. And the two parked slots agree: `0(sp)` and `4(sp)` are the 1st
and 2nd arguments, arriving only to be ignored. Three arguments, return the
last:

```c
s32 third(s32 a, s32 b, s32 c) {
    return c;
}
```

Now read your own target the same way. Which register does its `or` copy from?
What do the parked slots say? Count from `a0`, and that tells you both how many
arguments to declare and which one to return.

## Your task

Write `func_803d1c8c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_803d1c8c(s32 a, s32 b, s32 c, s32 d) {
    return d;
}
```
