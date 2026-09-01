---
id: e84b2cff-8cf0-4f86-ad5d-381c31623a9c
slug: gba-structs-padding
title: Reading the Padding
difficulty: 2
concepts:
  - structs
  - alignment
  - offsets
hints:
  - Lay the context struct out on paper first — one row per field, with the byte
    it starts at — inserting a hole wherever the next field's alignment demands
    one. Then match the three offsets in the target against your table.
  - A `struct Rec *` in, a `u32` out. Three fields are read — at offsets 2, 8
    and 12 — and the field at offset 4 is never touched.
symbol: func_0824a108
---

# Holes you have to account for

Field offsets follow declaration order, but they are not a running total of the
field sizes. Every field has to start at an address that is a multiple of its own
size — a `u32` on a multiple of 4, a `u16` on a multiple of 2 — so the compiler
inserts unnamed padding bytes whenever the next field would land somewhere
illegal.

The GBA adds a second rule that is easy to get wrong if you are coming from
other decomp work. agbcc rounds the *size* of every struct up to a multiple of
four, whatever is inside it. `sizeof(struct { u8 a; })` is 4 here, not 1. That
tail padding costs you nothing when you are reading a single field, and it costs
you everything the moment you index an array of these things.

Here is a function reading three fields of a twelve-byte header:

```asm
0        mov       r1, r0
2        ldrh      r0, [r1, #8]
4        ldrb      r2, [r1, #0]
6        add       r0, r2
8        ldrb      r1, [r1, #10]
10       add       r0, r1
12       bx        lr
```

The struct is `{ u8 ver; u32 magic; u16 len; u8 kind; }`. Count naively and you
would put `magic` at 1, `len` at 5 and `kind` at 7 — and every one of those
guesses is wrong. `magic` needs a multiple of 4, so three bytes of padding go in
after `ver` and it lands at 4. `len` follows at 8, `kind` at 10, and the struct
is rounded up from 11 to 12. So the halfword at 8 is `len` and the byte at 10 is
`kind`.

Read that backwards and padding becomes a source of information. An offset that
skips bytes is telling you those bytes exist — either as a field the function
never touches, or as a hole the alignment rules forced. When you are recovering
a struct definition from a real ROM, that is often the only evidence you get.

Your target reads three fields of the record in its context block. Build the
offset table before you start guessing.

## Your task

Write `func_0824a108` to reproduce the target assembly.

<!-- context -->
```c
struct Rec { u8 tag; u16 code; u8 slot; u32 total; u8 mark; };
```

<!-- solution -->
```c
u32 func_0824a108(struct Rec *r) {
    return r->total + r->code + r->mark;
}
```
