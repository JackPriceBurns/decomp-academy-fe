---
id: 1ee8cc80-56ae-4b6a-aa79-dd25b8b2a4e5
slug: structs-mixed-widths
title: "Narrow Fields and the Gaps Between"
difficulty: 2
concepts:
  - structs
  - types
  - alignment
symbol: func_803ba330
hints:
  - "The `lb` loads at offsets 0 and 1 are the two signed bytes. The `lw` at offset 4 is the word. One field of the struct is never used."
  - "Three loads are combined with two `addu`s. That is a single return expression that adds three fields."
---

# Offset math with real structs

Real game structs mix fields of different widths, such as a byte of flags and
a halfword of HP. Their offsets follow two rules:

1. **Each field is aligned to its own size.** Bytes can go anywhere.
   Halfwords go on even offsets, and words go on multiples of 4. The compiler
   adds hidden padding to make this true.
2. Apart from that, fields are packed in declaration order.

Apply the rules to this struct and check each comment:

```c
typedef struct {
    u8  kind;    // offset 0
    u8  level;   // offset 1
    s16 hp;      // offset 2  (even, so no padding needed)
    s32 score;   // offset 4
} Unit;

s32 unit_power(Unit *u) {
    return u->hp + u->level;
}
```

```asm
lh    t6, 2(a0)     # u->hp    (halfword at 2)
lbu   t7, 1(a0)     # u->level (byte at 1)
addu  v0, t6, t7
jr    ra
nop
```

Now the mnemonics and the offsets check each other in two ways. The width of
the load must match the declared width of the field. The sign of the load must
match the signedness of the field: `lh` for the `s16` and `lbu` for the `u8`,
as the type-oracle rules from the Types & Width chapter require. When you
rebuild an unknown struct in a real project, this is your evidence. Every
`lbu 3(…)` tells you there is a `u8` at offset 3. A gap that no load touches
is either padding or a field that this function does not use.

The target adds three fields of the `Mover` below and skips one. Work out the
offsets, then match each mnemonic to a field and check its sign.

## Your task

Write `func_803ba330` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_803ba330(Mover *m) {
    return m->dx + m->dy + m->ticks;
}
```

<!-- context -->
```c
typedef struct {
    s8  dx;
    s8  dy;
    u16 speed;
    s32 ticks;
} Mover;
```
