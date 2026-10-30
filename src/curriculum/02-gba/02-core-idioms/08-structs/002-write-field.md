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
  - "The function takes a `struct Cursor *` and an `s32`, and returns nothing.
    The `mov r1, #1` puts a constant in a register so that the `str` after it
    has a value to store."
symbol: func_08241220
---

# Storing to a field

A store uses the same addressing as a load: `str rV, [rB, #offset]`. The value
register comes first and the base register second. Thumb has no instruction
that stores an immediate value. So writing a constant to a field always takes
two steps: a `mov` puts the constant into a register, and then the `str` stores
it.

The registers also tell you whether the function returns anything. A return
value leaves in `r0`. If `r0` is still being used as a base register at the
last instruction, it was never rebuilt with a result, so nothing goes back to
the caller.

Here is a function that writes two fields of a score record:

```asm
0        str       r1, [r0, #4]
2        ldr       r2, [r0, #0]
4        add       r1, r2
6        str       r1, [r0, #8]
8        bx        lr
```

`r1` is the second argument, and it is stored directly into the field at
offset 4. Then the field at offset 0 is loaded and added to that same `r1`, and
the sum is stored at offset 8. The function touches three fields. `r0` never changes,
because the function has no value to return.

The pattern to learn here is the one at instructions 0 to 4 of your own target:
a load from an offset, an arithmetic instruction, and a store back to *the same*
offset. That is a field being updated in place. It is one C statement and three
instructions, and the original source used no temporary variable.

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
