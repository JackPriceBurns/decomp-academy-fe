---
id: structs-bitfield-multi
title: Multi-Bit Bitfield Writes
difficulty: 3
concepts:
  - structs
  - bitfields
  - rlwimi
symbol: Packed_setMode
hints:
  - "Assign the whole field: `p->mode = m;`."
  - A multi-bit field write is a single `rlwimi r0, r4, 5, 24, 26`.
---

# rlwimi inserts a whole field

The same insert instruction handles **multi-bit** bitfields. Writing several bits
at once doesn't need a hand-written mask-and-OR — `rlwimi` clears the target bits
and drops the new value in, in one shot.

Consider a different packed struct:

```c
typedef struct { u32 type : 4; u32 count : 4; u32 rest : 24; } Header;
```

Writing the second 4-bit field (`count`) produces:

```asm
lbz     r0, 0(r3)
rlwimi  r0, r4, 0, 28, 31
stb     r0, 0(r3)
blr
```

Read `rlwimi rA, rS, SH, MB, ME`: rotate `rS` left by `SH`, then copy bits
`MB..ME` into `rA`, leaving the rest alone. The mask bounds `MB, ME` mark exactly
which bits the field occupies in the 32-bit word; the rotate lines the incoming
value's low bits up with them. One `rlwimi` replaces a load / clear-mask / shift /
or / store sequence — that's the tell.

Now apply the same reasoning to:

```c
typedef struct { u32 mode : 3; u32 level : 5; u32 rest : 24; } Packed;
```

The field positions are different, so the rotate and mask operands will differ,
but the pattern is identical.

## Your task

With `Packed` above, write `Packed_setMode` to reproduce the target assembly.

<!-- starter -->
```c
void Packed_setMode(Packed* p, u32 m) {
}
```

<!-- solution -->
```c
void Packed_setMode(Packed* p, u32 m) {
    p->mode = m;
}
```

<!-- context -->
```c
typedef struct { u32 mode : 3; u32 level : 5; u32 rest : 24; } Packed;
```
