---
id: 42bdf0b5-1f9c-4be8-8158-d309a25d4162
slug: gba-structs-read-field
title: A Field Is an Offset
difficulty: 1
concepts:
  - structs
  - memory
  - offsets
hints:
  - Every offset is a count of bytes from the start of the struct. For a struct
    of four-byte fields, divide the offset by four to get the field's position
    in the declaration.
  - "The function takes one `struct Unit *` and returns an `s32`. Look at the
    order of the loads: the other values are subtracted from the field that is
    loaded first."
symbol: func_0823caac
---

# Field names do not survive compilation

A struct gives names to parts of a block of memory. Those names exist only for
the programmer. When the compiler is done, every field name has become a
constant byte offset, and that offset is stored in the immediate field of the
load instruction. The object file has no type information and no field names.
Nothing in it says that these bytes belong together.

This helps you when you read assembly. Fields are laid out in declaration
order. In a struct of `s32`s, the first field is at offset 0, the second at 4
and the third at 8. If you have the struct definition and an offset, you can
work out the field name by arithmetic.

Here is a function that reads two fields of a timer struct with three fields:

```asm
0        mov       r1, r0
2        ldr       r0, [r1, #4]
4        ldr       r1, [r1, #0]
6        sub       r0, r1
8        bx        lr
```

`[r1, #4]` is the second field and `[r1, #0]` is the first. With the struct
`{ s32 count; s32 limit; s32 step; }`, those are `limit` and `count`. The
function returns how much time is left.

The `mov r1, r0` at the top is worth understanding, because many functions in
this chapter start with it. The pointer arrives in `r0`, and the return value
must also leave in `r0`. The compiler needs the pointer for the second load as
well. So it first copies the pointer into `r1`, and then builds the result in
`r0` from instruction 2 onwards.

Your target reads three fields of the struct in its context block. Turn each
offset into a field name before you write any C.

## Your task

Write `func_0823caac` to reproduce the target assembly.

<!-- context -->
```c
struct Unit { s32 id; s32 hp; s32 maxHp; s32 shield; };
```

<!-- solution -->
```c
s32 func_0823caac(struct Unit *u) {
    return u->maxHp - u->hp - u->shield;
}
```
