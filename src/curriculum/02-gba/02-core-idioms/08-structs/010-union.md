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
  - Every member of a union starts at the same address. So the load's width and
    its offset from that address are the only evidence of which member the C
    named.
  - The function takes a `struct Msg *` and returns a `u32`. The byte load reads
    from inside the union member. The halfword load reads a field in front of
    it.
symbol: func_08264dc0
---

# Same address, different names

A union gives one region of memory several names and several types. Every
member starts at offset 0 of the union. The union is as large as its largest
member, rounded up to a multiple of four like every struct and union here.

None of this is visible in the assembly. There is no instruction that selects a
union member. The member you name only decides the *width* of the load and the
offset added to the union's own address. Two different member names can
produce the same instruction. The same address can be read in three different
ways by three different functions.

Here is a function that reads one union in two ways:

```asm
0        ldrb      r1, [r0, #3]
2        ldr       r0, [r0, #0]
4        add       r0, r1
6        bx        lr
```

The union is `{ u32 raw; struct { u16 lo; u16 hi; } h; u8 b[4]; }`. The `ldr`
at offset 0 has to be `raw`, because that is the only member a single word load
can produce. `h` is also four bytes wide, but no instruction loads a whole
struct. The `ldrb` at offset 3 has to be `b[3]`. `raw` and `h` are too wide,
and byte 3 is inside the range of the byte array. Width and offset together
identify the member. With only one of them, you are guessing.

A union inside a struct adds its own base offset to all of this. The sum
appears in the instruction as a single number, in the same way as for nested
structs.

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
