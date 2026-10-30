---
id: 731c1c87-235b-4855-9163-24190f407f2a
slug: arithmetic-add-registers
title: Adding Two Registers
difficulty: 1
concepts:
  - arithmetic
  - registers
symbol: func_800c7070
hints:
  - "Each `addu` adds two registers. A sum with more than one step keeps the partial result in a temporary register, and the final result goes into `v0`."
  - "Read the target from top to bottom, and note which arguments each line has added in so far."
---

# When both sides are runtime values

In the warmup you learned `addiu`, which adds a constant stored inside the
instruction. When *both* operands are values that only exist at runtime, there
is no constant to store. The compiler uses the register form instead,
`addu rd, rs, rt`:

```asm
addu v0, a0, a1    # v0 = a0 + a1
jr   ra
nop
```

That's `add2(x, y)` returning `x + y`. The destination comes first, as always.
As before, the `u` means "don't trap on overflow". It does not mean
"unsigned". Plain signed addition compiles to `addu`.

There is one more habit to learn here. When a computation takes more than one
step, the partial result has to be stored *somewhere*. IDO always picks the
same registers for this, in the same order: it uses temporaries starting at
**`t6`**, then `t7`, `t8` and so on. You will often see `t6` holding a partial
result in this compiler's output. It has no special meaning. It is just the
first scratch register on IDO's list.

The target below has one more step than the example. Look at which register
holds the partial sum, and which argument is added last.

## Your task

Write `func_800c7070` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_800c7070(s32 a, s32 b, s32 c) {
    return a + b + c;
}
```
