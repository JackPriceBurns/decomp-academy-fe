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

The same insert instruction handles **multi-bit** bitfields. Writing a 3-bit
field doesn't need to mask-and-OR by hand — `rlwimi` clears the target bits and
drops the new value in, in one shot. Given:

```c
typedef struct { u32 mode : 3; u32 level : 5; u32 rest : 24; } Packed;
```

`p->mode = m` (those 3 bits live at the top of the first byte) compiles to:

```asm
lbz     r0, 0(r3)
rlwimi  r0, r4, 5, 24, 26   # insert m's low 3 bits into mode
stb     r0, 0(r3)
blr
```

The mask operands `24, 26` mark exactly the three bits the field occupies; the
rotate `5` lines up `m`'s low bits with them. One `rlwimi` replaces a
load / clear-mask / shift / or / store sequence — recognizing it is how you map
the asm back to a clean bitfield assignment instead of a tangle of mask constants.

## Your task

With `Packed` above, write `Packed_setMode` storing `m` into `p->mode`.

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
