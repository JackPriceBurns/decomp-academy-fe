---
id: 152a19ed-fd53-4bc7-ae59-a59770c61438
slug: gba-structs-union
title: Unions
difficulty: 3
concepts:
  - structs
  - unions
  - types
hints:
  - Every member of a union starts at the same address, so the load's width and
    its offset from that address are the only evidence of which member the C
    named.
  - A `struct Msg *` in, a `u32` out. The byte load is inside the union member;
    the halfword load is a field in front of it.
symbol: func_08264dc0
---

# Same address, different names

A union gives one region of memory several names and several types. Every member
starts at offset 0 of the union, and the union is as large as its largest member
(rounded up to a multiple of four, like every aggregate here).

Nothing about that survives into the assembly. There is no instruction for
"select a union member" — the member you name only decides the *width* of the
load and the offset added to the union's own address. Two different member
names can produce the same instruction, and the same address can be read three
different ways in three different functions.

Here is a function reading one union two ways:

```asm
0        ldrb      r1, [r0, #3]
2        ldr       r0, [r0, #0]
4        add       r0, r1
6        bx        lr
```

The union is `{ u32 raw; struct { u16 lo; u16 hi; } h; u8 b[4]; }`. The `ldr` at
offset 0 has to be `raw`, the only member a single word load can produce — `h`
is four bytes wide as well, but no instruction loads a struct. The `ldrb` at
offset 3 has to be `b[3]`: `raw` and `h` are too wide, and byte 3 is inside the
byte array's range. Width and offset together pick the
member; either one alone leaves you guessing.

A union inside a struct just adds its own base offset to all of that, and the
sum arrives in the instruction as a single number, the same way nesting does.

Your target reads a union member and an ordinary field. Split the byte load's
offset into "where the union starts" plus "which member".

## Your task

Write `func_08264dc0` to reproduce the target assembly.

<!-- context -->
```c
union Word { u32 all; u16 half[2]; u8 byte[4]; };
struct Msg { u16 kind; u16 len; union Word data; };
```

<!-- solution -->
```c
u32 func_08264dc0(struct Msg *m) {
    return m->data.byte[3] + m->kind;
}
```
