---
id: cbce5df4-a71f-47ff-bf12-06c5f1ff3346
slug: gba-types-capstone
title: "Capstone: Widths and Signs"
difficulty: 5
concepts:
  - narrow-types
  - promotion
  - stores
symbol: func_081f0bf8
hints:
  - Offset 0 is read twice, with a different instruction each time. The first
    read feeds a store back into the same field. The second read is the value
    the function returns.
  - The function takes one `Fighter *` and returns an `s32`. It adds `mod` to
    `hp`, adds one to `lvl`, then returns `hp`.
---

# Three fields, three patterns

Everything in this chapter shows up together when a function uses a struct with
fields of different widths. Here is an example, using a struct laid out as an
`s8`, a `u8` and an `s16`:

```asm
0        mov       r2, #0
2        ldrsb     r2, [r0, r2]
4        mul       r2, r1
6        ldrh      r1, [r0, #2]
8        sub       r1, r2
10       strh      r1, [r0, #2]
12       bx        lr
```

There are two unexpected things in these seven instructions.

The `s16` field at offset 2 is read with a plain `ldrh`. Lesson four said that
reading a signed halfword means putting the offset in a register and using
`ldrsh`. That is true when the upper bits matter. Here the result of the
subtraction goes straight back into the same field through `strh`, which keeps
16 bits and drops the rest. Extending the loaded value could not change anything
the store writes, so gcc leaves the extension out. This means `ldrh` does not
prove the field is a `u16`. A read-modify-write of an `s16` field looks exactly
the same as one on a `u16` field, and the assembly cannot tell you which it was.

The `s8` field at offset 0 is read with `ldrsb`. Lesson four said a signed byte
normally cannot use this instruction. Here is the exact rule. The pattern for
sign-extending a byte has no spare operand, so the index has to be held in the
load's destination register. This means agbcc can use `ldrsb` only when the
destination register is different from the base register. In this function the
pointer is in `r0` and the value goes into `r2`, so the rule is met. When the
loaded value goes back into the register that held the pointer, the shift pair
is used instead. You cannot choose between these two forms from C.

If you read the same field to use its value, instead of to store it back, the
load changes again:

```asm
0        mov       r1, #2
2        ldrsh     r0, [r0, r1]
4        bx        lr
```

This is the same struct and the same field. Now the caller receives all 32 bits,
so the sign extension is needed and the compiler emits it.

Every load and store in your target is a pattern from this chapter. Use each
offset to work out which field it touches. Note which offsets are written back,
and decide what each loaded value is used for.

## Your task

Write `func_081f0bf8` to reproduce the target assembly.

<!-- context -->
```c
typedef struct { s16 hp; u8 lvl; s8 mod; } Fighter;
```

<!-- solution -->
```c
s32 func_081f0bf8(Fighter *f) {
    f->hp = f->hp + f->mod;
    f->lvl = f->lvl + 1;
    return f->hp;
}
```
