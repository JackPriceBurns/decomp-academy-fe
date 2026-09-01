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
    inverse mask. Negate it back to get n, and n minus one is the mask of the
    bits being cleared."
  - A `struct Obj2 *` and a `u32` in, nothing out. One assignment to one
    bitfield, and every instruction in the target comes from that single
    statement.
symbol: func_0826dca8
---

# Read, clear, insert, store

Writing a bitfield is a read-modify-write, and the compiler always spells it the
same way: mask the incoming value down to the field's width, shift it up into
position, load the word, clear the field's bits, `orr` the new value in, store
back.

Two details make it hard to read at first. The clearing mask is the *inverse* of
the field, so it is a large negative-looking constant — and Thumb has no
instruction to move one. The compiler builds small ones with `mov rX, #n`
followed by `neg rX, rX`, which is how `mov r2, #64` / `neg r2, r2` means
`0xFFFFFFC0`, the mask that clears bits 0 to 5. Bigger ones come out of the
literal pool as a `.word` at the end of the function.

The other detail is the access width. The read-modify-write goes through the
*narrowest* unit that contains the field, so a field living in the low byte is
loaded with `ldrb` and stored with `strb` even though the field was declared
`u32`. The read side does not match it: reading that same field loads the whole
word with `ldr` and shifts it down, so one field can be read with `ldr` and
written with `ldrb`/`strb` in the same translation unit.

Here is a 6-bit field at bit 0 being assigned:

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

`mov r2, #63` / `and r1, r2` truncates the incoming value to 6 bits — the mask
is always `(1 << width) - 1`. There is no shift after it because this field
starts at bit 0. Then `ldrb`, the inverse mask via `mov #64` / `neg`, the `and`
that clears, the `orr` that inserts, and the `strb` back. Eight instructions
and a return, all of it from `c->speed = v`.

Your target writes a field that does not start at bit 0, so it has one more
instruction than this. Read the two masks and the shift, and all three numbers
have to agree on the same field.

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
