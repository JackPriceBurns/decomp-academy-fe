---
id: 3c2b8af2-75d0-441c-b0e1-304ddee4800b
slug: structs-flag-set
title: "Setting a Flag"
difficulty: 2
concepts:
  - structs
  - flags
  - rmw
symbol: func_8030ae28
hints:
  - "`lbu`/`ori`/`sb` all use the same offset. Find the byte field of `Enemy` at that offset. The `ori` immediate is the flag being set."
  - "Write one `|=` line. Write the flag constant in hex, as the listing does."
---

# flags |= BIT

Games track many on/off facts for each object, such as whether it has been
seen, is invincible, or is in the air. These facts are packed as single bits
in a flag byte. Setting one bit is the RMW sandwich with `ori` in the middle.
It is so common that you should learn to recognize it on sight:

```c
typedef struct {
    u8 flags;    // offset 0, bit 2 = "active"
    u8 kind;     // offset 1
    s16 hp;      // offset 2
} Ent;

void set_active(Ent *e) {
    e->flags |= 4;
}
```

```asm
lbu   t6, 0(a0)     # read the flag byte
ori   t7, t6, 0x4   # switch bit 2 on
sb    t7, 0(a0)     # write it back
jr    ra
nop
```

`lbu`, `ori` and `sb` all use the same offset. The `ori` immediate is the
mask: `0x4` is bit 2, `0x10` is bit 4, and `0x81` is bits 7 and 0 together.
OR leaves every other bit unchanged, which is why it is used here. The other
flags in the byte keep their values.

This is *not* a bitfield. Real code has both: a `u8` used as a flag byte, and
structs full of 1-bit bitfields. The flag byte compiles to these short
`ori`/`andi` patterns, each from one line of C, with hex masks chosen by the
programmer. In C, it is written as a plain integer field with `#define`d or
literal masks. When you see `ori` with a round hex immediate on a byte field,
decompile it as `|=`.

In the target, the flag byte is not the first field of the struct. Check the
offset against the `Enemy` layout below before you name it. A different bit
is set, too.

## Your task

Write `func_8030ae28` to reproduce the target assembly.

<!-- solution -->
```c
void func_8030ae28(Enemy *e) {
    e->flags |= 0x10;
}
```

<!-- context -->
```c
typedef struct {
    u8 state;
    u8 flags;
    u8 timer;
    u8 pad;
    s32 target;
} Enemy;
```
