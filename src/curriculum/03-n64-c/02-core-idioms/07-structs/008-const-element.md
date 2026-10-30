---
id: 5546752b-3c43-4a52-8e9b-6c58040663e3
slug: structs-const-element
title: "A Constant Element Folds Away"
difficulty: 3
concepts:
  - structs
  - arrays
  - offsets
  - rmw
symbol: func_801519d4
hints:
  - "The load and the store use the same offset. Split it into element × 20 + field before you write anything."
  - "The middle of the sandwich is a register `addu` with the second argument. That is a compound assignment on one element's field."
---

# element × sizeof + field, worked out in advance

When you index an array of structs with a *constant*, the multiply chain from
the last lesson disappears. The compiler works out
`index × sizeof + field offset` at compile time and puts the total into the
offset of a single instruction:

```c
typedef struct {
    s32 x;    // offset 0
    s32 y;    // offset 4
    s32 z;    // offset 8
} Vec3;      // sizeof = 12

s32 second_z(Vec3 *arr) {
    return arr[1].z;
}
```

```asm
lw    v0, 20(a0)    # 1*12 + 8: element 1, field z
jr    ra
nop
```

Again this is one `lw`. It is the third C shape you have seen compile to a
single load with an offset: `v[5]`, `p->field`, and now `arr[k].field`. The
assembly cannot tell you which of these the original source used. Only the
declared type of the pointer decides how to read the offset. On a `Vec3 *`,
offset 20 *must* mean `[1].z`, because you split it by the struct's size
first: 20 ÷ 12 = element 1, remainder 8 = `z`.

This habit matters most in real code, for large offsets on pointers to struct
arrays. At first `76(a0)` tells you nothing. Divide by the struct size and it
splits into "element 3, second word".

The target updates one field of one fixed element of a `Mob` array (20 bytes
each, see the context below). It is the RMW sandwich, with the offset already
combined into one number. Split the offset, then write the compound
assignment.

## Your task

Write `func_801519d4` to reproduce the target assembly.

<!-- solution -->
```c
void func_801519d4(Mob *list, s32 amount) {
    list[2].hp += amount;
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
