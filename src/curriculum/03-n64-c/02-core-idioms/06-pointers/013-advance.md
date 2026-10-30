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
  - "There are three stores at increasing offsets, with the three value arguments in order, then one `addiu` that produces the returned pointer. Count the bytes that the `addiu` skips."
  - "The C writes each argument through the pointer with `*p++ = …;` and returns `p`. There is no arithmetic apart from the increments."
---

# `*p++` three times becomes three offsets and one add

The C idiom for "append and advance" is `*p++ = value;`. If you write it
several times in a row, you might expect several pointer increments in the
assembly. IDO does better than that. It knows where each write lands
relative to the *original* pointer, so it uses offsets, and it increments the
pointer **once**, at the end, by the total:

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

The C has two increments, but there are no `addiu`s between the stores. Each
`++` became "+4 on the next offset". The single `addiu … 8` at the end adds
up the total: the returned pointer is the original plus the whole distance
moved. Returning the advanced pointer is the only reason the increments are
kept at all. A caller needs to know where the writing stopped, so small
helpers that write values and return the moved cursor are common in code that
builds buffers.

To read it back: stores at `0, 4, 8, …` from one base, followed by an `addiu`
of the base plus the total, are a run of `*p++ =` statements, one per store.
The value stored at each offset gives you the right-hand side of each
statement.

The target writes its value arguments in parameter order, and returns the
moved cursor.

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
