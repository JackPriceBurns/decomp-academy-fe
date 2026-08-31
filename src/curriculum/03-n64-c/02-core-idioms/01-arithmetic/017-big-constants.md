---
id: e606f38a-5452-479d-999a-0c96015d58e0
slug: arithmetic-big-constants
title: "lui/ori: Constants Too Big to Ride"
difficulty: 2
concepts:
  - immediates
  - registers
symbol: func_80181bcc
hints:
  - "`lui` fills the top 16 bits, `ori` fills the bottom 16. Write the two
    immediates side by side as one eight-digit hex number."
  - "The `lui` immediate lands shifted up by 16 — 0x5 up there means 0x50000."
---

# Sixteen bits at a time

The immediate field of an instruction holds 16 bits, and warmup promised that
asking for more would take a pair of instructions. Here's the pair, building
0x20033:

```asm
lui v0, 0x2         # v0 = 0x0002_0000 — the immediate, parked in the TOP half
ori v0, v0, 0x33    # v0 = 0x0002_0033 — OR the bottom half in
jr  ra
nop
```

**`lui`** — **l**oad **u**pper **i**mmediate — writes its 16-bit immediate
into the *upper* half of the register and zeroes the lower half. So `lui` of
0x2 doesn't make 2; it makes 0x20000. Then **`ori`** — OR immediate — fills
the bottom 16 bits, which the `lui` conveniently left as zeros.

Reading the pair is pure concatenation: glue the `lui` immediate to the `ori`
immediate and you have the full 32-bit constant. `lui 0x2` + `ori 0x33` =
`0x0002_0033`. That's it — no arithmetic, just place-value.

Two habits to build now:

- **Constants this size are almost always meaningful in hex** — addresses,
  bit patterns, packed fields. Write them in hex in your C unless the decimal
  is obviously the intent.
- A `lui` with **no `ori` after it** means the low half is all zeros — one
  instruction, constant like 0x80000. Don't add an `ori 0x0` that isn't there;
  the compiler doesn't.

The target below is one pair. Concatenate and return.

## Your task

Write `func_80181bcc` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_80181bcc(void) {
    return 0x54321;
}
```
