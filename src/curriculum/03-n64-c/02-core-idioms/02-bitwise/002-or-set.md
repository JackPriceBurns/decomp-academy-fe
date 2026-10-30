---
id: cd1f489b-79d3-4480-b687-c5b7341d6c87
slug: bitwise-or-set
title: "ori: Forcing Bits On"
difficulty: 1
concepts:
  - bitwise
  - immediates
symbol: func_80347d20
hints:
  - "The `ori` immediate lists exactly the bits that are forced on. Copy it into your C unchanged."
  - "If the hex is hard to read, write the constant out in binary. Each 1 is a switch being turned on."
---

# OR to force bits on

With OR, a bit of the result is 1 if *either* input has a 1. With a constant
mask, the ones in the mask are **forced on**, and the zeros leave the input
bits unchanged. Here is a function that switches on bit 15:

```asm
ori v0, a0, 0x8000   # force bit 15 on, keep the rest
jr  ra
nop
```

In C this is `x | 0x8000`. You have used `ori` since the warmup. There it
built constants from `zero`, and more recently it helped `lui` build 32-bit
values. Both of those were the same operation: OR-ing bits into a register
that held zeros in every bit that mattered. Now the other operand is a *live*
value from the program.

As with `andi`, the immediate is zero-extended, so it covers only the low 16
bits. Like masks, constants that set bits are almost always flags. Game code
often ORs in bits such as "active", "dirty" or "visible", so you will see this
instruction a lot. When a target ORs several separate bits at once, the C is
still one `|` with one constant. Count the ones in the immediate and write
them as a single hex number.

The mask in the target below has more than one bit set. Read all of them.

## Your task

Write `func_80347d20` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80347d20(s32 a) {
    return a | 0x111;
}
```
