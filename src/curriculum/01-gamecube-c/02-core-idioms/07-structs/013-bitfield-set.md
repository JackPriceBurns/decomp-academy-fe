---
id: 618869a7-48ac-517a-88c0-08de8b6cdd4d
slug: structs-bitfield-set
title: "A Single-Bit Flag: li; rlwimi"
difficulty: 3
concepts:
  - structs
  - bitfields
  - rlwimi
symbol: func_800621a4
hints:
  - Use the bitfield assignment `f->active = 1;`, not a manual `|= mask`.
  - It compiles to `li r4, 1` then `rlwimi r0, r4, 7, 24, 24` — not `ori`.
---

# Single-bit bitfields compile to rlwimi

Get this idiom wrong and nothing matches. A single-bit C bitfield assigned 1
won't turn into a hand-rolled OR-mask. Take this struct:

```c
typedef struct { u8 active : 1; u8 visible : 1; u8 dead : 1; } Flags;
```

Assigning any one of these bits makes the compiler load the whole byte, rotate
the new value into the bit's slot with `rlwimi` (rotate-left-word-immediate,
then mask-insert), and write the byte back. Set the second bit, `visible`, and
you get:

```asm
lbz     r0, 0(r3)
li      r4, 1
rlwimi  r0, r4, 6, 25, 25
stb     r0, 0(r3)
blr
```

`rlwimi rA, rS, SH, MB, ME` works like this: rotate `rS` left by `SH`, then
drop bits `MB..ME` of that result into `rA`, leaving everything else untouched.
Shift the field one bit further into the byte and the rotate amount and mask
bounds each move by one — the field's position sets those numbers.

Now contrast the manual spelling `*p |= mask`. That emits an `ori`:

```asm
lbz  r0, 0(r3)
ori  r0, r0, 1
stb  r0, 0(r3)
```

The bytes end up identical, but the instructions don't. A `li; rlwimi` pair
writing a single bit came from a `u8 x:1` bitfield assignment, not a
hand-written `|= mask`. Mask-and-OR by hand gives `ori` rather than `rlwimi`,
and that won't line up with the compiled output.

## Your task

Using the `Flags` struct provided, write `func_800621a4` to reproduce the
target assembly.

<!-- solution -->
```c
void func_800621a4(Flags* f) {
    f->active = 1;
}
```

<!-- context -->
```c
typedef struct { u8 active : 1; u8 visible : 1; u8 dead : 1; } Flags;
```
