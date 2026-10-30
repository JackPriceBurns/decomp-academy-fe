---
id: 38f8dfe5-e1d4-48cb-af9d-00add73e5028
slug: adv-volatile
title: "volatile: Every Access Is Real"
difficulty: 3
concepts:
  - volatile
  - globals
  - cse
  - hardware
symbol: func_8023e37c
hints:
  - "There are two loads through one address, then a subtraction. The operand order of the `subu` tells you which read comes first in your C."
  - "The extern is already declared `vu32`, so you do not add the keyword anywhere. Use the global twice."
---

# A keyword that keeps every load

In the last chapter you saw CSE merge repeated subexpressions. This lesson
shows a case where that is *not allowed*. Compare two functions that each use
a global twice. First, `twoPlain()` returns `gCount + gCount`, where `gCount`
is a plain `u32`:

```asm
lui    v1, %hi(gCount)
lw     v1, %lo(gCount)(v1)
addu   v0, v1, v1        # ONE load, used twice: CSE as usual
jr     ra
nop
```

Now `twoReads()`. The C is the same, but `gTick` is declared **`vu32`**, a
*volatile* `u32`:

```asm
lui    v1, %hi(gTick)
addiu  v1, v1, %lo(gTick)
lw     t6, 0(v1)         # first read
lw     t7, 0(v1)         # a real second read
addu   v0, t6, t7
jr     ra
nop
```

`volatile` tells the compiler that the value can change between accesses in
ways it cannot see. For example, a hardware timer may count up, or another
part of the system may write to it. So every read in the source must become
a load in the machine code, in source order. The compiler may not keep the
value in a register, and it may not merge two reads. The address is built
once (`lui` + `addiu`, because it is used twice), but the *data* is loaded
again each time.

This matters on this console because hardware registers (video, audio,
controllers) are memory-mapped. Reading one twice can return two different
values. Game code declares them with volatile typedefs like `vu32`, and you
can see the effect directly in the assembly. If you see repeated loads
through one address that CSE would normally have merged, the optimizer has
done nothing wrong. Look for a `volatile` in the declaration. Your C must
access the global exactly as many times as the target loads it.

The target reads its volatile global twice and combines the two reads with a
different operation. Pay attention to which read goes on which side.

## Your task

`extern vu32 gTimer;` is declared for you. Write `func_8023e37c` to reproduce the
target assembly.

<!-- solution -->
```c
s32 func_8023e37c(void) {
    return gTimer - gTimer;
}
```

<!-- context -->
```c
extern vu32 gTimer;
```
