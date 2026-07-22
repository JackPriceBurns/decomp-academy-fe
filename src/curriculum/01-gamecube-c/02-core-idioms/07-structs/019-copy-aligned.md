---
id: e23e5754-a5d9-5ecf-8502-3319e868a2af
slug: structs-copy-aligned
title: Eight-Byte Alignment Copies Through Float Registers
difficulty: 2
concepts:
  - structs
  - copy
  - alignment
  - floats
symbol: Record_copy
hints:
  - "`lfd`/`stfd` move 8 bytes at a time through the float registers — even when
    the struct holds no floating-point fields at all."
  - A 64-bit member (`u64`/`s64`/`f64`) forces the struct to 8-byte alignment,
    which is what lets the copy use doubleword float loads and stores.
---

# Float registers move integer data

Drop a 64-bit member into a struct and the whole thing snaps to **8-byte
alignment**. That changes the game for copies. Now MWCC can shovel **8 bytes a
step** through `lfd` and `stfd`, the doubleword float load and store, instead of
crawling 4 bytes at a time with `lwz`/`stw`. And here's the twist: the struct
doesn't need a single float in it. The float registers are just wide buckets
here. Nothing gets added, multiplied, or rounded.

Here's a 24-byte record built from three 64-bit integers:

```c
typedef struct { u64 lo; u64 mid; u64 hi; } Wide;

void Wide_copy(Wide* out, Wide* in) {
    *out = *in;
}
```

```asm
lfd   f1, 0(r4)     # in->lo   (8 bytes at once)
lfd   f0, 8(r4)     # in->mid
stfd  f1, 0(r3)     # out->lo
stfd  f0, 8(r3)     # out->mid
lfd   f0, 16(r4)    # in->hi
stfd  f0, 16(r3)    # out->hi
blr
```

Three doublewords, moved in `lfd`/`stfd` pairs with one single left at the end.
Same skeleton as the integer-word copy from last lesson, just eight bytes a step
rather than four. So when you spot `lfd`/`stfd` hauling a struct that holds no
`f32`/`f64` anywhere, that's an aligned copy talking, not float math. Whatever
you do reading it back, don't hand the struct floating-point members it never
had.

The target does this to a smaller 8-byte-aligned struct. Clock the doubleword
float moves, then reproduce the assignment they came from.

## Your task

With the `Record` struct above, write `Record_copy` to reproduce the target
assembly.

<!-- solution -->
```c
void Record_copy(Record* dst, Record* src) {
    *dst = *src;
}
```

<!-- context -->
```c
typedef struct { s64 key; s64 hash; } Record;
```
