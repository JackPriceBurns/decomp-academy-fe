---
id: f365d21a-12b9-4a9e-b583-66ad1075de18
slug: gba-structs-write-field
title: Writing a Field
difficulty: 2
concepts:
  - structs
  - memory
  - stores
hints:
  - A load and a store at the same offset, with arithmetic in between, is one
    field being updated in place.
  - "A `struct Cursor *` and an `s32` in, nothing out. The `mov r1, #1` parks a
    literal in a register so the `str` after it has something to store."
symbol: func_08241220
---

# Storing through a field name

A store uses the same addressing as a load: `str rV, [rB, #offset]`, with the
value first and the base second. Thumb has no store-immediate form, so a
constant being written to a field always arrives in two steps — a `mov` to get
the constant into a register, then the `str`.

Register traffic tells you whether there is a result at all. A value leaves in
`r0`, so when `r0` is still serving as a base register at the last instruction,
it was never rebuilt and nothing is going back to the caller.

Here is a function that writes two fields of a score record:

```asm
0        str       r1, [r0, #4]
2        ldr       r2, [r0, #0]
4        add       r1, r2
6        str       r1, [r0, #8]
8        bx        lr
```

`r1` is the second argument and it goes straight into the field at offset 4.
Then the field at offset 0 is loaded, added to that same `r1`, and the sum is
stored at offset 8. Three fields touched, and `r0` is never disturbed because
the function has no value to return.

The shape to learn here is the one at instructions 0 to 4 of your own target: a
load from an offset, an arithmetic instruction, and a store back to *the same*
offset. That is a field being updated in place — one C statement, three
instructions, and no temporary variable in the original source.

## Your task

Write `func_08241220` to reproduce the target assembly.

<!-- context -->
```c
struct Cursor { s32 x; s32 y; s32 page; s32 dirty; };
```

<!-- solution -->
```c
void func_08241220(struct Cursor *c, s32 d) {
    c->page = c->page + d;
    c->dirty = 1;
}
```
