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
    element's size. The offset in each load tells you which field it reads.
  - One load in the body is a signed halfword, and the other is not. Match each
    load to a field in the struct you were given. Then read the compare that
    decides whether the accumulate happens.
  - "The function takes an `Ent *` and an `s32` count, and returns an `s32`. Only entries whose timer is above zero are added. What each one adds is the other narrow field."
symbol: func_082d4814
---

# The stride is the size and the offset is the field

A loop over an array of structs tells you the struct's layout in two ways. The
constant that advances the pointer at the bottom of the body is the `sizeof` of
the element. Every load inside the body contains the offset of the field that
it reads. Combine those with each load's width and signedness, and you can name
each field without seeing the header.

Here is a scan over an array of this eight-byte element:

```c
typedef struct {
    u16 id;
    u8  layer;
    u8  slot;
    s16 depth;
    s16 spare;
} Obj;
```

The scan keeps the largest `depth` that it finds:

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

`add r0, #8` at 18 is the stride, and 8 is `sizeof(Obj)`. The load at 10 reads
offset 4, which is `depth`. It is an `ldrsh`, so that field is signed and
sixteen bits wide. Together, those two instructions give you the element's
size, and the offset, width and signedness of one field.

The pair at 8 and 10 is the ARMv4T limitation that you met in the types
chapter. Thumb has `ldrsh` only in the register-offset form, so the offset
cannot be an immediate. agbcc has to put the offset in a register first. Notice
where that `mov` is: inside the body, at the branch target, so it runs on every
iteration. The masks in the first lesson of this chapter were hoisted above the
loop. This `mov` stays inside it.

Next, look at the prologue. This function calls nothing, but it still pushes a
callee-saved register and returns with `pop {r1} ; bx r1` instead of `bx lr`.
It needed one more low register than r0-r3 provide, and using r4 is what makes
it build a frame. Read `push {r4, lr}` as a count of how many values have to
stay alive. It does not prove that the function calls anything.

The rest is the loop shape you already know. The entry guard at 4 skips the
body when the count is not positive. The back edge at 24 counts the trip count
down to zero, because the subscript was strength-reduced into the walking
pointer at 18.

Your target scans a smaller element and reads two different fields from it in
the same body. The offsets and the load widths are all you need to match those
loads to the struct you were given.

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
