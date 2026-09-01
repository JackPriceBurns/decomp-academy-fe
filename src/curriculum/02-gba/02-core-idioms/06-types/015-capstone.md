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
    read feeds a store back into the same field; the second read is the value
    that leaves the function.
  - "One `Fighter *` in, an `s32` out. Add `mod` into `hp`, add one to `lvl`,
    then return `hp`."
---

# Three fields, three shapes

Everything in this chapter shows up at once when a function touches a struct
with fields of different widths. Here is one, on a struct laid out as an `s8`,
a `u8` and an `s16`:

```asm
0        mov       r2, #0
2        ldrsb     r2, [r0, r2]
4        mul       r2, r1
6        ldrh      r1, [r0, #2]
8        sub       r1, r2
10       strh      r1, [r0, #2]
12       bx        lr
```

Two surprises in seven instructions.

The `s16` field at offset 2 is read with a plain `ldrh`. Lesson four said a
signed halfword read is a materialised offset and `ldrsh`, and it is - when the
upper bits matter. Here the result of the subtraction goes straight back into
the same field through `strh`, which keeps 16 bits and drops the rest, so
extending the loaded value could not change anything the store writes. gcc drops
the extension. So `ldrh` does not mean the field is a `u16`: a read-modify-write
of an `s16` field looks identical to one on a `u16` field, and no amount of
staring at the assembly will separate them.

The `s8` field at offset 0 is read with `ldrsb`, the form lesson four said a
signed byte normally cannot reach. Here is the exact condition. The byte
sign-extend pattern has no spare operand, so the index has to live in the load's
destination register, which means agbcc can use `ldrsb` only when the
destination differs from the base. In this function the pointer is in `r0` and
the value lands in `r2`, so it fits. When the loaded value goes back into the
register that held the pointer, the shift pair comes back instead. Neither form
is something you choose from C.

Read the same field for its value rather than to store it back and the load
changes again:

```asm
0        mov       r1, #2
2        ldrsh     r0, [r0, r1]
4        bx        lr
```

Same struct, same field, and now the full 32 bits are what the caller receives,
so the sign extension is paid for.

Every load and store in your target is a shape from this chapter. Work out which
field each one touches from its offset, watch which offsets are written back,
and decide what each loaded value is being used for.

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
