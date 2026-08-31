---
id: 14b42ac0-46f3-4893-b4fa-0e84a8c4f412
slug: pointers-advance
title: "Post-Increment Becomes Offsets"
difficulty: 3
concepts:
  - pointers
  - stores
  - offsets
symbol: func_8012d0a8
hints:
  - "Three stores at climbing offsets, three value arguments in order, then one `addiu` producing the returned pointer. Count the bytes the `addiu` skips."
  - "The C writes each argument through the pointer with `*p++ = …;` and returns `p`. No arithmetic beyond the increments."
---

# `*p++` three times = three offsets and one add

The C idiom for "append and advance" is `*p++ = value;`. Written
several times in a row, you might expect several pointer increments in
the assembly. IDO has a better idea — it knows where each write lands
relative to the *original* pointer, so it uses offsets and increments
the pointer **once**, at the end, by the total:

```c
s32 *emit2(s32 *p, s32 v) {
    *p++ = v;
    *p++ = v;
    return p;
}
```

```asm
sw    a1, 0(a0)     # first  *p++ = v  → offset 0
sw    a1, 4(a0)     # second *p++ = v  → offset 4
addiu v0, a0, 8     # p, advanced past both writes, returned
jr    ra
nop
```

Two increments in the C; zero `addiu`s between the stores. Each `++`
became "+4 on the next offset", and the lone `addiu … 8` settles the
account: the returned pointer is the original plus the total distance
walked. Returning the advanced pointer is what keeps the increments
alive at all — a caller needs to know where the writing stopped, so
these little emit-and-return-cursor helpers are everywhere in code
that builds buffers.

Reading it back: stores stepping `0, 4, 8, …` off one base, ending in
`addiu` of base + total — that's a run of `*p++ =` statements, one per
store. What's stored at each offset tells you each statement's
right-hand side.

The target pushes its value arguments, in parameter order, and returns
the moved cursor.

## Your task

Write `func_8012d0a8` to reproduce the target assembly.

<!-- solution -->
```c
s32 *func_8012d0a8(s32 *p, s32 a, s32 b, s32 c) {
    *p++ = a;
    *p++ = b;
    *p++ = c;
    return p;
}
```
