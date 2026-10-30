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
  - "Arguments map to a0, a1, a2, a3 in order. Read the source register of the `or` and count to find its position."
  - "Each `sw` at the top parks one unused argument in its own slot: 0(sp) is the first argument, 4(sp) the second, 8(sp) the third."
---

# Your first function from scratch

There is no starter code this time. You get an empty editor and the name
`func_803d1c8c` in the header. You read everything else from the target.

Look at the target. There are some parking stores at the top, a single `or`
into `v0`, and then the return. You know `or rd, rs, zero` from the warmup: it
is how MIPS copies one register to another. And `v0` is the return register. So
this function takes one of its arguments and returns it unchanged. The only
thing left to work out is *which* argument.

You find that by counting registers. Take a function whose body is:

```asm
sw   a0, 0(sp)
sw   a1, 4(sp)
or   v0, a2, zero
jr   ra
nop
```

The source of the copy is `a2`, the **3rd** argument register, so this function
returns its third parameter. The two parked slots agree with this: `0(sp)` and
`4(sp)` are the 1st and 2nd arguments, which arrive and are ignored. So there
are three arguments, and the function returns the last one:

```c
s32 third(s32 a, s32 b, s32 c) {
    return c;
}
```

Now read your own target the same way. Which register does its `or` copy from?
What do the parked slots tell you? Count from `a0`. That tells you how many
arguments to declare and which one to return.

## Your task

Write `func_803d1c8c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_803d1c8c(s32 a, s32 b, s32 c, s32 d) {
    return d;
}
```
