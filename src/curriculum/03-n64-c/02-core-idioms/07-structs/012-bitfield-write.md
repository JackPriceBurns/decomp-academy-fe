---
id: 141ea5f8-d1e6-4d63-a109-bd91d654f598
slug: structs-bitfield-write
title: "Bitfields: Writing a Slice"
difficulty: 4
concepts:
  - bitfields
  - masks
  - rmw
symbol: func_80107a94
hints:
  - "The keep-mask `0xff0f` has a 4-bit hole at bits 4..7. That hole is the field being replaced. The `sll` moves the new value into it."
  - "`kind` is in the top nibble of the first byte. Write one assignment line, and all five instructions come from it."
---

# Clear the hole, then insert the value

Writing *one* bitfield must not change the fields next to it. So the compiler
does a full read-modify-write. It loads the packed storage, masks out the old
slice, moves the new value into position, merges the two, and stores the
result back. Every bitfield write follows these steps:

```c
typedef struct {
    u32 mode : 3;    // bits 7..5 of the first byte
    u32 level : 5;   // bits 4..0
    u32 rest : 24;
} Packed;

void set_level(Packed *p, u32 v) {
    p->level = v;
}
```

```asm
lbu   t8, 0(a0)      # the byte holding mode+level
andi  t7, a1, 0x1f   # new value clipped to 5 bits
andi  t9, t8, 0xffe0 # keep-mask: everything EXCEPT level's bits
or    t0, t7, t9     # merge new slice into cleared hole
sb    t0, 0(a0)      # store the byte back
jr    ra
nop
```

The two masks describe the same field from opposite sides. `0x1f` covers the
five bits of `level`, and `0xffe0` covers everything else. The **hole in the
keep-mask shows where the field is**: bits 4..0, the low end of the first
byte. (IDO has again narrowed the whole operation to one byte, `lbu`/`sb`,
because both fields it touches are in that byte.)

Expect two variations. If the field does not end at bit 0, the new value gets
an `sll` to move it into position. The shift amount is the field's distance
from the bottom of its byte or word. Also, IDO *leaves out* the `andi` that
clips the value when the shift and the narrow store already make sure no
stray bits can get in. Sometimes a mask you expect is not needed, and the
compiler can prove it.

The target writes the other field of a byte split 4+4 (see the context
below). Read the hole in its keep-mask and its shift, then write the one
assignment they point to.

## Your task

Write `func_80107a94` to reproduce the target assembly.

<!-- solution -->
```c
void func_80107a94(Tag *t, u32 k) {
    t->kind = k;
}
```

<!-- context -->
```c
typedef struct {
    u32 kind : 4;
    u32 flags : 4;
    u32 rest : 24;
} Tag;
```
