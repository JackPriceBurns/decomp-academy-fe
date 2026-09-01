---
id: 99e6b683-def5-4ebf-8bc0-3f552fd805ea
slug: gba-structs-narrow-field
title: Narrow Fields
difficulty: 2
concepts:
  - structs
  - types
  - loads
hints:
  - The mnemonic gives you the width and the offset gives you the position.
    Match each load against the context struct until only one field fits both.
  - A `struct Sprite *` in, an `s32` out, and three fields added together. The
    order the loads appear in is the order the C names them.
symbol: func_08245994
---

# The load width names the type

Real console structs are packed with narrow fields, because a GBA has 256K of
work RAM and an entity table has hundreds of entries. So most struct loads you
will read are not `ldr`.

The mnemonic tells you the field's width directly: `ldr` for a four-byte field,
`ldrh` for a two-byte one, `ldrb` for a single byte. All three are zero-extending
here — the value arrives in the register with the top bits clear and no extra
work — which means an unsigned narrow field costs exactly one instruction, the
same as a word.

Signedness is the other half of the type, and it is never free. An `s8` field
comes back as `ldrb` followed by `lsl #24` / `asr #24`, and an `s16` field forces
the register-offset `ldrsh` with a `mov` just to hold the offset. If you see a
bare `ldrb` or `ldrh` with nothing after it, the field was unsigned.

Here is a function reading two fields of a four-byte cell:

```asm
0        mov       r1, r0
2        ldrh      r0, [r1, #0]
4        ldrb      r1, [r1, #3]
6        add       r0, r1
8        bx        lr
```

With `struct Cell { u16 count; u8 kind; u8 team; }` the halfword at 0 is
`count`, and the byte at 3 is `team` — the *fourth* byte of the struct, because
`kind` took byte 2 and `team` byte 3. Width plus offset identifies a field
uniquely; neither one alone does.

Your target reads three fields of a sprite record. Two of the loads are the same
mnemonic at different offsets, so read the offsets carefully.

## Your task

Write `func_08245994` to reproduce the target assembly.

<!-- context -->
```c
struct Sprite { u8 kind; u8 level; u16 hp; u32 xp; };
```

<!-- solution -->
```c
s32 func_08245994(struct Sprite *s) {
    return s->hp + s->level + s->kind;
}
```
