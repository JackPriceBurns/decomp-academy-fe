---
id: fe6435b3-f041-4f09-9c96-88f5e66033a5
slug: gba-structs-bitfield-write
title: Writing a Bitfield
difficulty: 4
concepts:
  - structs
  - bitfields
  - masking
hints:
  - "`mov rX, #n` followed by `neg rX, rX` is a small negative constant: the
    inverse mask. Negate it to get n. Then n minus one is the mask of the bits
    being cleared."
  - The function takes a `struct Obj2 *` and a `u32`, and returns nothing. It
    makes one assignment to one bitfield, and every instruction in the target
    comes from that single statement.
symbol: func_0826dca8
---

# Read, clear, insert, store

Writing a bitfield is a read-modify-write, and the compiler always does it in
the same order. It masks the incoming value down to the field's width and
shifts it up into position. Then it loads the word, clears the field's bits,
uses `orr` to insert the new value, and stores the word back.

Two details make this code hard to read at first. The first is that the
clearing mask is the *inverse* of the field, so it is a large constant that
looks negative. Thumb has no instruction that moves such a constant into a
register. The compiler builds small ones with `mov rX, #n` followed by
`neg rX, rX`. This is how `mov r2, #64` / `neg r2, r2` gives `0xFFFFFFC0`, the
mask that clears bits 0 to 5. Larger ones are loaded from the literal pool, as
a `.word` at the end of the function.

The second detail is the access width. The read-modify-write uses the
*narrowest* unit that contains the field. So a field in the low byte is loaded
with `ldrb` and stored with `strb`, even though the field was declared `u32`.
Reads of the field do not follow this rule. Reading the same field loads the
whole word with `ldr` and shifts it down. So in the same translation unit, one
field can be read with `ldr` and written with `ldrb`/`strb`.

Here is an assignment to a 6-bit field at bit 0:

```asm
0        mov       r2, #63
2        and       r1, r2
4        ldrb      r3, [r0, #0]
6        mov       r2, #64
8        neg       r2, r2
10       and       r2, r3
12       orr       r2, r1
14       strb      r2, [r0, #0]
16       bx        lr
```

`mov r2, #63` / `and r1, r2` cuts the incoming value down to 6 bits. The mask
is always `(1 << width) - 1`. There is no shift after it, because this field
starts at bit 0. Then come the `ldrb`, the inverse mask built with `mov #64` /
`neg`, the `and` that clears the field, the `orr` that inserts the value, and
the `strb` that stores it back. That is eight instructions and a return, all
from `c->speed = v`.

Your target writes a field that does not start at bit 0, so it has one more
instruction than this. Read the two masks and the shift. All three numbers must
describe the same field.

## Your task

Write `func_0826dca8` to reproduce the target assembly.

<!-- context -->
```c
struct Obj2 {
    u32 pal : 4;
    u32 shape : 2;
    u32 tile : 10;
    u32 rest : 16;
};
```

<!-- solution -->
```c
void func_0826dca8(struct Obj2 *o, u32 v) {
    o->shape = v;
}
```
