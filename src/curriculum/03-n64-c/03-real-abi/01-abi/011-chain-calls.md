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
  - "Two `jal`s, and the `or a0, v0, zero` between them pipes the first result into the second call. Read the calls inside-out."
  - "After the second call returns, one more instruction adjusts `v0` before the epilogue — fold that into your expression."
---

# v0 today, a0 tomorrow

When one call's result is exactly the next call's argument, no stack slot is
needed — the value goes straight from `v0` into `a0`. Here's `chainTwo(x)`,
which returns `second(first(x))`:

```asm
addiu  sp, sp, -24
sw     ra, 20(sp)
jal    first           # first(x) — x already in a0
nop
jal    second
or     a0, v0, zero    # first's result becomes second's argument
lw     ra, 20(sp)
addiu  sp, sp, 24
jr     ra
nop
```

The whole idiom is that one `or a0, v0, zero`, sitting in the second `jal`'s
delay slot. Nested calls in C read inside-out — `first` runs, then `second` —
and the assembly lays them out top to bottom in execution order. When you see
back-to-back `jal`s glued by `or a0, v0, zero`, write nesting, not two
statements.

And note what's *missing*: no home-slot traffic. Nothing here is needed *after*
a call except the value already flowing forward in `v0`, so there's nothing to
protect. Compare that with the last lesson — the presence or absence of those
stores tells you whether a value crosses a call.

The target is the same pipeline with a small coda after the second call. Don't
forget it.

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
