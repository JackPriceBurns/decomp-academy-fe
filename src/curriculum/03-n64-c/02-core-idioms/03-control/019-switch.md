---
id: 170ac667-f16a-4a52-a642-de86d9383a8d
slug: control-switch
title: A Small switch
difficulty: 4
concepts:
  - control-flow
  - branches
  - switch
  - fingerprints
symbol: func_801c2b18
hints:
  - "Read the case values off the `at` constants — and note the FIRST branch is a `beqz`, which means one of the cases is zero."
  - "The value loaded before the `b` is the default. Each case's return value sits in a `jr ra` delay slot."
---

# The equality ladder

A `switch` with a few cases doesn't get anything fancy — IDO lays it out as
a chain of constant-equality tests, and every trick in it is one you
already own: constants staged through `at`, `beq` per case, values in
delay slots. Here's a three-case switch over 1, 2, 3 returning 10, 20, 30
with default 0:

```asm
 0:  addiu at, zero, 1    # case 1?
 4:  beq   a0, at, 0x24
 8:  addiu at, zero, 2    # (delay slot) — the NEXT case's constant!
 c:  beq   a0, at, 0x2c
10:  addiu at, zero, 3    # (slot again) case 3's constant
14:  beq   a0, at, 0x34
18:  or    v0, zero, zero # (slot) no case hit: the default value
1c:  b     0x3c           # default path exits
20:  nop
24:  jr    ra
28:  addiu v0, zero, 10   # case 1 returns 10
2c:  jr    ra
30:  addiu v0, zero, 20   # case 2 returns 20
34:  jr    ra
38:  addiu v0, zero, 30   # case 3 returns 30
3c:  jr    ra
40:  nop
```

The elegant part is the slot usage: **each `beq`'s delay slot loads the
*next* case's constant**. Taken or not, the load is harmless — if the branch
fires, the freshly loaded `at` simply goes unused. The ladder pipelines
itself, one comparison flowing into the next, and the last slot preloads the
default. Then a run of paired `jr ra` + value exits, one per case, in case
order.

Decoding one of these is bookkeeping: list the `at` constants (the case
labels), pair each `beq` target with its exit value, catch the default on
the fall-through. Write it as a real `switch` — that's what the original
programmer had.

The target has three cases and a default too, but different labels and
values — and one case's label is a value that needs no `at` at all. You know
which branch handles that one.

## Your task

Write `func_801c2b18` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_801c2b18(s32 t) {
    switch (t) {
    case 0:
        return 4;
    case 2:
        return 9;
    case 5:
        return 16;
    default:
        return 1;
    }
}
```
