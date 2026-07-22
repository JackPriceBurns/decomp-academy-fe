---
id: 618869a7-48ac-517a-88c0-08de8b6cdd4d
slug: structs-bitfield-set
title: "A Single-Bit Flag: li; rlwimi"
difficulty: 3
concepts:
  - structs
  - bitfields
  - rlwimi
symbol: Flags_setActive
hints:
  - Use the bitfield assignment `f->active = 1;`, not a manual `|= mask`.
  - It compiles to `li r4, 1` then `rlwimi r0, r4, 7, 24, 24` — not `ori`.
---

# Single-Bit Bitfields Compile to rlwimi

Get this idiom wrong and nothing matches. A single-bit C bitfield assigned 1 will
not turn into a hand-rolled OR-mask. Take this struct:

```c
typedef struct { u8 active : 1; u8 visible : 1; u8 dead : 1; } Flags;
```

Assigning any one of these bits makes the compiler load the whole byte, rotate
the new value into the slot that bit occupies with `rlwimi`
(rotate-left-word-immediate, then mask-insert), and write the byte back. Set the
second bit, `visible`, and out comes:

```asm
lbz     r0, 0(r3)
li      r4, 1
rlwimi  r0, r4, 6, 25, 25
stb     r0, 0(r3)
blr
```

Here's how `rlwimi rA, rS, SH, MB, ME` reads. Rotate `rS` left by `SH`, then drop
bits `MB..ME` of that result into `rA`, leaving everything else in `rA`
untouched. Shift the field one bit further along in the byte and the rotate
amount and the two mask bounds each move by one. So the field's spot inside the
struct is what sets those numbers.

Now contrast the manual spelling, `*p |= mask`. That one emits an `ori` instead:

```asm
lbz  r0, 0(r3)
ori  r0, r0, 1
stb  r0, 0(r3)
```

The bytes end up identical, but the instructions don't. A `li; rlwimi` pair
writing a single bit always came from a `u8 x:1` bitfield assignment, never from a
hand-written `|= mask`. Mask-and-OR by hand gives you `ori` rather than `rlwimi`,
and that simply won't line up with the compiled output.

## Your task

With `Flags` above, write `Flags_setActive` to reproduce the target assembly.

<!-- solution -->
```c
void Flags_setActive(Flags* f) {
    f->active = 1;
}
```

<!-- context -->
```c
typedef struct { u8 active : 1; u8 visible : 1; u8 dead : 1; } Flags;
```
