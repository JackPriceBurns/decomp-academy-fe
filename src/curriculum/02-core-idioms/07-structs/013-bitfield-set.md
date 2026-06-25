---
id: structs-bitfield-set
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

Here is a make-or-break idiom. A **single-bit C bitfield** set to 1 does *not*
compile to a manual OR-mask. Given:

```c
typedef struct { u8 active : 1; u8 visible : 1; u8 dead : 1; } Flags;
```

Setting any single-bit field loads the whole byte, rotates the new value into the
right position with `rlwimi` (rotate-left-word-immediate-then-**mask-insert**),
and stores it back. For example, setting the second bit (`visible`) produces:

```asm
lbz     r0, 0(r3)
li      r4, 1
rlwimi  r0, r4, 6, 25, 25
stb     r0, 0(r3)
blr
```

Read `rlwimi rA, rS, SH, MB, ME` as "rotate `rS` left by `SH`, then copy bits
`MB..ME` of the result into `rA`, leaving the rest of `rA` alone". The rotation
amount and mask bounds differ by one for each successive bit position in the byte
— the key is that the field's position within the struct drives those values.

Contrast the *manual* version `*p |= mask`, which instead emits an `ori`:

```asm
lbz  r0, 0(r3)
ori  r0, r0, 1
stb  r0, 0(r3)
```

Same memory effect, **different instructions**. When you see `li; rlwimi`
writing one bit, the original was a `u8 x:1` bitfield assignment — never a
hand-written `|= mask`. A manual mask-and-OR produces `ori` instead of `rlwimi`,
so it won't match the compiled output.

## Your task

With `Flags` above, write `Flags_setActive` to reproduce the target assembly.

<!-- starter -->
```c
void Flags_setActive(Flags* f) {
}
```

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
