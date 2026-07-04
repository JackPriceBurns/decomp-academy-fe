---
id: e34d7857-0746-5410-a131-cf9ce9c6f138
slug: structs-copy-large
title: Big Structs Copy in a Loop
difficulty: 3
concepts:
  - structs
  - copy
  - loops
  - optimization
symbol: Tilemap_copy
hints:
  - Past 64 bytes MWCC stops unrolling and emits a counted `mtctr`/`bdnz` loop
    that moves 8 bytes per turn, with a single trailing word after it.
  - The `li r0, N` count times 8, plus the one trailing word, equals the struct's
    size — the loop is still just a whole-struct assignment.
---

# When the copy gets too big to unroll

Unrolling a copy into one `lwz`/`stw` per word is fine for a handful of words,
but past **64 bytes** MWCC switches strategy and emits an actual **copy loop**. It
moves 8 bytes per iteration with the update-form loads and stores (`lwzu`/`stwu`,
which bump the pointer as they go) and counts down with the `ctr` register via
`bdnz`.

Take a 68-byte struct (seventeen words):

```c
typedef struct { u32 samples[17]; } AudioBlock;

void AudioBlock_copy(AudioBlock* out, AudioBlock* in) {
    *out = *in;
}
```

```asm
li     r0, 8         # 8 loop iterations
subi   r5, r3, 4     # bias destination pointer back by 4...
subi   r4, r4, 4     # ...and source, so the update-form +8 lands right
mtctr  r0
.loop:
lwz    r3, 4(r4)     # grab a word
lwzu   r0, 8(r4)     # grab the next, advance src by 8
stw    r3, 4(r5)
stwu   r0, 8(r5)     # store, advance dst by 8
bdnz   .loop
lwz    r0, 4(r4)     # one trailing word: 8*8 + 4 = 68
stw    r0, 4(r5)
blr
```

Work backward from the loop count and the trailing word to recover the size: the
count is `8`, the loop carries 8
bytes each pass (`8 × 8 = 64`), and the lone trailing `lwz`/`stw` adds the final 4
— `64 + 4 = 68` bytes. (Note the compiler even borrows `r3`, the destination
pointer, as a scratch register inside the loop.) A `mtctr`/`bdnz` block whose
loads and stores do nothing but shuttle words from one pointer to another is a
whole-struct assignment of a large struct — there is no logic hiding in it.

The target copies a larger struct with the same loop. The struct below is already
given, so once you recognise the pattern the assignment writes itself.

## Your task

With the `Tilemap` struct above, write `Tilemap_copy` to reproduce the target
assembly.

<!-- starter -->
```c
void Tilemap_copy(Tilemap* dst, Tilemap* src) {
}
```

<!-- solution -->
```c
void Tilemap_copy(Tilemap* dst, Tilemap* src) {
    *dst = *src;
}
```

<!-- context -->
```c
typedef struct { u32 cells[23]; } Tilemap;
```
