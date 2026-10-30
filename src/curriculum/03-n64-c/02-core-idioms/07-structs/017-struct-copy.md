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
  - "Count the lw/sw pairs and multiply by 4. That is how many bytes are copied, and it matches `sizeof(Pack)`."
  - "Write one assignment statement. The narrow fields inside do not change the C you write, because the whole struct is copied at once."
---

# *d = *s

In C you can assign one struct to another with a single `=`. IDO compiles
this as a run of word-sized loads and stores. There is no loop and no helper
call, and the bytes move four at a time. Here is `copyVec`, which copies a
12-byte vector:

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

There are three `lw`/`sw` pairs, at offsets 0, 4, 8. That is twelve bytes,
which is exactly `sizeof(Vec3i)`. This arithmetic is how you recognize the
pattern: **pairs × 4 = the size of the struct being assigned**. The compiler
switches between `at` and `t8` as scratch registers, so that each load can
overlap the previous store. The offsets are the part to read.

There are two things this shape is *not*:

- It is not field-by-field code. The copy ignores what the fields are. A
  struct of three `s32`s and a struct of six `u16`s both copy as word pairs.
  If the C copied the fields one at a time, you would see loads that match
  each field's width (`lhu`, `lbu`) instead.
- It is not a call. Much larger structs are eventually passed to a copy
  routine, but small ones are always copied inline like this.

So when a run of `lw`/`sw` pairs copies between two pointers at matching
offsets, and the field types do not explain it, write one assignment, not N.

The target copies a smaller struct whose fields are *not* all word-sized. The
listing does not change because of that, which is the point of this lesson.

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
