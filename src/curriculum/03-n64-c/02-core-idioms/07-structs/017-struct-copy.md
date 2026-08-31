---
id: dde1a6c6-bfc3-4425-a8c4-33c11836f890
slug: structs-copy
title: "Copying a Struct Whole"
difficulty: 3
concepts:
  - structs
  - copies
  - fingerprints
symbol: func_80378698
hints:
  - "Count the lw/sw pairs and multiply by 4 — that's how many bytes move, and `sizeof(Pack)` agrees."
  - "One assignment statement. The narrow fields inside don't change the C you write; the whole struct copies at once."
---

# *d = *s

C lets you assign one struct to another in a single `=`, and IDO
compiles it as a run of word-sized loads and stores — no loop, no
helper, just the bytes moving four at a time. Here's `copyVec`, which
copies a 12-byte vector:

```c
typedef struct { s32 x, y, z; } Vec3i;

void copyVec(Vec3i *d, Vec3i *s) {
    *d = *s;
}
```

```asm
 0:  lw    at, 0(a1)    # word 0 in…
 4:  sw    at, 0(a0)    # …word 0 out
 8:  lw    t8, 4(a1)    # word 1
 c:  sw    t8, 4(a0)
10:  lw    at, 8(a1)    # word 2
14:  sw    at, 8(a0)
18:  jr    ra
1c:  nop
```

Three `lw`/`sw` pairs, offsets marching 0, 4, 8 — twelve bytes, which
is exactly `sizeof(Vec3i)`. That arithmetic is the fingerprint:
**pairs × 4 = the size of the struct being assigned**. The compiler
ping-pongs between `at` and `t8` as scratch so each load can overlap
the previous store, but the offsets are what you read.

Two things this shape is *not*:

- It's not field-by-field code. The copy doesn't know or care what the
  fields are — a struct of three `s32`s and a struct of six `u16`s
  both copy as word pairs. If the C had copied fields one at a time
  you'd see width-matched loads (`lhu`, `lbu`) instead.
- It's not a call. Much larger structs eventually get handed to a
  copy routine, but small ones inline like this every time.

So when you meet an unexplained run of `lw`/`sw` pairs walking two
pointers in lockstep, write one assignment, not N.

The target copies a smaller struct whose fields are *not* all
word-sized — and the listing doesn't care, which is rather the point.

## Your task

Write `func_80378698` to reproduce the target assembly.

<!-- solution -->
```c
void func_80378698(Pack *d, Pack *s) {
    *d = *s;
}
```

<!-- context -->
```c
typedef struct {
    u16 a, b;
    s32 c;
} Pack;
```
