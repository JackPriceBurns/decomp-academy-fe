---
id: e4c94b76-fb58-4fee-8b06-e15c61e3770b
slug: structs-struct-array
title: "Arrays of Structs: The sizeof Multiply"
difficulty: 3
concepts:
  - structs
  - arrays
  - strength-reduction
symbol: func_8013252c
hints:
  - "Decode the shift-add chain as a constant multiply first — that constant is `sizeof(Mob)`. The chain here computes ×(4+1)×4."
  - "The final load's offset picks the field. Offset 8 into a `Mob` — which member is that?"
---

# Indexing when the stride isn't a power of two

An array of structs strides by `sizeof(struct)` — and struct sizes are
rarely tidy powers of two. So the indexing trio's `sll` gets replaced
by an old friend from the arithmetic chapter: a **shift-and-add
multiply chain**, building index × sizeof without a multiply
instruction. Here's a 12-byte struct:

```c
typedef struct {
    s32 x;    // offset 0
    s32 y;    // offset 4
    s32 z;    // offset 8
} Vec3;      // sizeof = 12

s32 get_y(Vec3 *arr, s32 i) {
    return arr[i].y;
}
```

```asm
sll   t6, a1, 2     # i * 4
subu  t6, t6, a1    # i*4 - i  = i * 3
sll   t6, t6, 2     # i*3 * 4  = i * 12 — sizeof(Vec3)
addu  t7, a0, t6    # arr + i*12 = &arr[i]
lw    v0, 4(t7)     # …and field y, via the offset
jr    ra
nop
```

Two decoding layers, cleanly separated:

- **The chain before the `addu` is a constant multiply** — run the
  algebra like any ×K chain, and the K it produces is the struct's
  size. Chains feeding an address computation are the main way struct
  sizes reveal themselves in real listings.
- **The load's offset is the field**, exactly as with a lone struct
  pointer: address of element `i`, plus 4, is `arr[i].y`.

So the full read is "arr, i times 12, plus 4": element and field in one
breath. Nothing else in this chapter changes — narrow fields, RMW,
nesting all work the same once `&arr[i]` is in a register.

The target indexes the 20-byte `Mob` below. Its chain builds ×20 a
slightly different way — decode it, confirm it against `sizeof`, then
let the final offset choose the field.

## Your task

Write `func_8013252c` to reproduce the target assembly.

<!-- solution -->
```c
s32 func_8013252c(Mob *list, s32 i) {
    return list[i].x;
}
```

<!-- context -->
```c
typedef struct {
    s32 id;
    s32 hp;
    s32 x;
    s32 y;
    s32 anim;
} Mob;
```
