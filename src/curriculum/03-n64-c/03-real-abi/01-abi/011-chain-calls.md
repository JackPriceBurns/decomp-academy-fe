---
id: 81751f76-5bea-4f13-af5e-a2b3f59971aa
slug: abi-chain-calls
title: Feeding One Call Into the Next
difficulty: 3
concepts:
  - abi
  - calls
  - delay-slots
symbol: func_8005d47c
hints:
  - "There are two `jal`s, and the `or a0, v0, zero` between them passes the first result to the second call. Read the calls from the inside out."
  - "After the second call returns, one more instruction changes `v0` before the epilogue. Include that in your expression."
---

# From v0 into a0

When one call's result is exactly the next call's argument, no stack slot is
needed. The value goes straight from `v0` into `a0`. This is `chainTwo(x)`,
which returns `second(first(x))`:

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
jal    first           # first(x): x is already in a0
nop
jal    second
or     a0, v0, zero    # first's result becomes second's argument
lw     ra, 20(sp)
addiu  sp, sp, 24
jr     ra
nop
```

The whole pattern is one instruction, `or a0, v0, zero`, in the delay slot of
the second `jal`. Nested calls in C read from the inside out: `first` runs,
then `second`. The assembly lists them from top to bottom in the order they
run. When you see two `jal`s in a row joined by `or a0, v0, zero`, write a
nested call instead of two statements.

Also notice what is *missing*: there are no stores to or loads from the home
slots. Nothing is needed *after* a call except the value passed on in `v0`, so
there is nothing to save. Compare this with the last lesson. Whether those
stores appear tells you whether a value is kept across a call.

The target is the same chain of calls with one small extra step after the
second call. Don't forget it.

## Your task

`extern s32 shape(s32 v);` and `extern s32 polish(s32 v);` are declared for
you. Write `func_8005d47c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8005d47c(s32 x) {
    return polish(shape(x)) + 1;
}
```

<!-- context -->
```c
extern s32 shape(s32 v);
extern s32 polish(s32 v);
```
