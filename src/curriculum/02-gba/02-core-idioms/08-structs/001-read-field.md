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
  - "One `struct Unit *` in, an `s32` out. Read the load order: the field loaded
    first is the one everything else is taken away from."
symbol: func_0823caac
---

# Fields do not survive compilation

A struct is a naming scheme for the programmer. By the time the compiler is
done, every field name has become a constant byte offset, and the offset is
baked into the load instruction's immediate field. There is no type information
left in the object file, no field names, nothing that says these bytes belong
together.

That works in your favour when you are reading. Field offsets are laid out in
declaration order, so a struct of `s32`s puts the first field at 0, the second
at 4, the third at 8. Given the struct definition and an offset, the field name
is arithmetic.

Here is a function that reads two fields of a three-field timer:

```asm
0        mov       r1, r0
2        ldr       r0, [r1, #4]
4        ldr       r1, [r1, #0]
6        sub       r0, r1
8        bx        lr
```

`[r1, #4]` is the second field, `[r1, #0]` is the first — with the struct
`{ s32 count; s32 limit; s32 step; }` that is `limit` and `count`, and the
function returns how much time is left.

The `mov r1, r0` at the top is worth understanding, because it opens many of the
functions in this chapter. The pointer arrives in `r0`, and the return value has
to leave in `r0`. The compiler needs the pointer for the second load too, so it
copies it out of the way first and then builds the result in `r0` from
instruction 2 onwards.

Your target reads three fields of the struct in its context block. Turn each
offset into a name before you write a single line of C.

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
