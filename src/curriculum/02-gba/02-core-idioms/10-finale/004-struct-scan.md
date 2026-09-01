---
id: 42d024ba-2714-4f70-869e-58aeb66c2ff0
slug: gba-finale-struct-scan
title: Scanning Structs
difficulty: 4
concepts:
  - structs
  - loops
  - narrow-types
hints:
  - The constant that advances the pointer at the bottom of the loop is the
    element's size. Every load's offset names a field at that offset.
  - One load in the body is a signed halfword and one is not. Match each to a
    field in the struct you were given, then read the compare that decides
    whether the accumulate happens.
  - "An `Ent *` and an `s32` count in, an `s32` out. Only entries whose timer is above zero contribute, and what they contribute is the other narrow field."
symbol: func_082d4814
---

# The stride is the size, the offset is the field

A walk over an array of structs tells you the layout twice over. The constant
that advances the pointer at the bottom of the body is `sizeof` the element, and
every load inside the body carries the offset of the field it reads. Put those
together with the load's width and signedness and you can name each field
without ever seeing the header.

Here is a scan over this eight-byte element:

```c
typedef struct {
    u16 id;
    u8  layer;
    u8  slot;
    s16 depth;
    s16 spare;
} Obj;
```

keeping the largest `depth` it finds:

```asm
0        push      {r4, lr}
2        mov       r3, #0
4        cmp       r3, r1
6        bge       26 ~>
8      ~>mov       r4, #4
10       ldrsh     r2, [r0, r4]
12       cmp       r2, r3
14       ble       18 ~>
16       mov       r3, r2
18     ~>add       r0, #8
20       sub       r1, #1
22       cmp       r1, #0
24       bne       8 ~>
26     ~>mov       r0, r3
28       pop       {r4}
30       pop       {r1}
32       bx        r1
```

`add r0, #8` at 18 is the stride, and 8 is `sizeof(Obj)`. The load at 10 reaches
offset 4, which lands on `depth`, and it is an `ldrsh`, so that field is signed
and sixteen bits wide. Between them, those two instructions give you the
element's size and one field's offset, width and signedness.

The pair at 8 and 10 is the awkward part of ARMv4T you met in the types chapter.
Thumb has `ldrsh` only in the register-offset form, so the offset cannot be an
immediate — agbcc has to build it in a register first. What is worth noticing
here is where that `mov` sits: inside the body, at the branch target, running on
every single trip. The masks in the first lesson of this chapter got hoisted
above the loop; this one does not.

Then look at the prologue. This function calls nothing at all, and it still
pushes a callee-saved register and returns through `pop {r1} ; bx r1` rather
than `bx lr`. It needed one more low register than r0-r3 gave it, and asking for
r4 is what costs the frame. Read `push {r4, lr}` as a census of how many values
have to stay alive, not as proof that something gets called.

The rest is the loop shape you know: an entry guard at 4 that skips the body when
the count is not positive, and a back edge at 24 whose trip count is counted down
to zero because the subscript was strength-reduced into the walking pointer at
18.

Your target scans a smaller element and reads two different fields out of it in
the same body. The offsets and the load widths are all you need to match them to
the struct you have been given.

## Your task

Write `func_082d4814` to reproduce the target assembly.

<!-- context -->
```c
typedef struct {
    u8  kind;
    u8  hp;
    s16 timer;
} Ent;
```

<!-- solution -->
```c
s32 func_082d4814(Ent *e, s32 n) {
    s32 i;
    s32 total = 0;
    for (i = 0; i < n; i++) {
        if (e[i].timer > 0) total += e[i].hp;
    }
    return total;
}
```
