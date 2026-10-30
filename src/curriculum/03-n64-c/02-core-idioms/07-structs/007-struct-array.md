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
  - "First decode the shift-and-add chain as a constant multiply. That constant is `sizeof(Mob)`. The chain here computes ×(4+1)×4."
  - "The offset of the final load picks the field. Which member of a `Mob` is at offset 8?"
---

# Indexing when the stride isn't a power of two

In an array of structs, the stride is `sizeof(struct)`, and struct sizes are
rarely powers of two. So the `sll` of the indexing trio is replaced by a
pattern from the arithmetic chapter: a **shift-and-add multiply chain**. It
computes index × sizeof without a multiply instruction. Here is a 12-byte
struct:

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
sll   t6, t6, 2     # i*3 * 4  = i * 12, which is sizeof(Vec3) * i
addu  t7, a0, t6    # arr + i*12 = &arr[i]
lw    v0, 4(t7)     # …and field y, via the offset
jr    ra
nop
```

There are two separate parts to decode:

- **The chain before the `addu` is a constant multiply.** Work through the
  algebra as for any ×K chain. The K you get is the size of the struct. In
  real listings, a chain that feeds an address calculation is the main way to
  find a struct's size.
- **The load's offset is the field**, just as with a pointer to a single
  struct. The address of element `i`, plus 4, is `arr[i].y`.

So the whole access reads as "arr, plus i times 12, plus 4". That gives the
element and the field together. Everything else in this chapter still applies.
Narrow fields, RMW and nesting all work the same way once `&arr[i]` is in a
register.

The target indexes the 20-byte `Mob` below. Its chain builds ×20 in a
slightly different way. Decode it and check it against `sizeof`. Then use the
final offset to choose the field.

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
