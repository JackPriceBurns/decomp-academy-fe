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
  - Lay the context struct out on paper first. Write one row per field, with the
    byte it starts at, and insert a hole wherever the next field's alignment
    requires one. Then match the three offsets in the target against your table.
  - The function takes a `struct Rec *` and returns a `u32`. Three fields are
    read, at offsets 2, 8 and 12. The field at offset 4 is never touched.
symbol: func_0824a108
---

# Holes you have to account for

Field offsets follow declaration order. Adding up the sizes of the earlier
fields does not always give the right offset, though. Every field has to start
at an address that is a multiple of its own size: a `u32` on a multiple of 4
and a `u16` on a multiple of 2. When the next field would start at an address
that breaks this rule, the compiler inserts unnamed padding bytes before it.

The GBA adds a second rule, and people who have done decomp work on other
platforms often get it wrong. agbcc rounds the *size* of every struct up to a
multiple of four, whatever it contains. `sizeof(struct { u8 a; })` is 4 here,
not 1. This padding at the end of the struct does not matter when you read a
single field. It matters a lot as soon as you index an array of these structs.

Here is a function that reads three fields of a twelve-byte header:

```asm
0        mov       r1, r0
2        ldrh      r0, [r1, #8]
4        ldrb      r2, [r1, #0]
6        add       r0, r2
8        ldrb      r1, [r1, #10]
10       add       r0, r1
12       bx        lr
```

The struct is `{ u8 ver; u32 magic; u16 len; u8 kind; }`. If you only add up
the sizes, you would put `magic` at 1, `len` at 5 and `kind` at 7. All of those
guesses are wrong. `magic` needs a multiple of 4, so three bytes of padding go
in after `ver`, and `magic` starts at 4. `len` follows at 8 and `kind` at 10,
and the struct size is rounded up from 11 to 12. So the halfword at 8 is `len`
and the byte at 10 is `kind`.

You can also use this in the other direction and treat padding as information.
An offset that skips bytes tells you that those bytes exist. They are either a
field the function never touches, or a hole that the alignment rules forced.
When you recover a struct definition from a real ROM, this is often the only
evidence you have.

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
