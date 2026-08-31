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
  - "The keep-mask `0xff0f` has a 4-bit hole at bits 4..7 — that hole is the field being replaced. The `sll` moves the new value into it."
  - "`kind` occupies the top nibble of the first byte. One assignment
    line; all five instructions fall out of it."
---

# Surgery: clear the hole, insert the value

Writing *one* bitfield can't disturb its neighbors, so the compiler
performs the full RMW surgery: load the packed storage, mask out the
old slice, position the new value, merge, store back. Every write
follows this score:

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

Both masks tell the same story from opposite sides — `0x1f` is
level's five bits, `0xffe0` is everything else — and the **hole in
the keep-mask locates the field**: bits 4..0, the low end of the
first byte. (IDO has again narrowed the whole affair to one byte,
`lbu`/`sb`, since both fields it touches live there.)

Two variations to expect. If the field doesn't end at bit 0, the new
value gets an `sll` to slide it into position — the shift amount is
the field's distance from the bottom of its byte or word. And IDO
*skips* the value's clipping `andi` when the shift plus the narrow
store already guarantee stray bits can't land — masks that "should"
be there sometimes provably aren't needed, and the compiler knows.

The target writes the other field of a 4+4 split byte (context
below). Read its keep-mask's hole and its shift, then write the one
assignment they imply.

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
