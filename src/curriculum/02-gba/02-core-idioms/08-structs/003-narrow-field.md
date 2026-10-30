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
  - The function takes a `struct Sprite *`, returns an `s32`, and adds three
    fields together. The loads appear in the same order that the C names the
    fields.
symbol: func_08245994
---

# The load width gives you the type

Real console structs are full of narrow fields. A GBA has 256K of work RAM, and
an entity table has hundreds of entries. So most of the struct loads you read
will not be `ldr`.

The mnemonic tells you the width of the field: `ldr` for a four-byte field,
`ldrh` for a two-byte field and `ldrb` for a single byte. All three are
zero-extending here. The value arrives in the register with the top bits clear,
and no extra work is needed. This means an unsigned narrow field costs one
instruction, the same as a word.

Signedness is the other half of the type, and it always costs extra
instructions. An `s8` field is read as `ldrb` followed by `lsl #24` /
`asr #24`. An `s16` field forces the compiler to use the register-offset form
`ldrsh`, with a `mov` whose only job is to hold the offset. If you see a bare
`ldrb` or `ldrh` with nothing after it, the field was unsigned.

Here is a function that reads two fields of a four-byte cell:

```asm
0        mov       r1, r0
2        ldrh      r0, [r1, #0]
4        ldrb      r1, [r1, #3]
6        add       r0, r1
8        bx        lr
```

With `struct Cell { u16 count; u8 kind; u8 team; }`, the halfword at 0 is
`count` and the byte at 3 is `team`. That is the *fourth* byte of the struct,
because `kind` takes byte 2 and `team` takes byte 3. Width and offset together
identify a field. Neither one is enough on its own.

Your target reads three fields of a sprite record. Two of the loads use the
same mnemonic at different offsets, so read the offsets carefully.

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
