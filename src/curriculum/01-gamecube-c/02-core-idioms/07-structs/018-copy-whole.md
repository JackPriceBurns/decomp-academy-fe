---
id: 78110c13-7a9c-5f32-9185-ce618a4ed85f
slug: structs-copy-whole
title: Copying a Whole Struct
difficulty: 2
concepts:
  - structs
  - copy
  - load
  - store
symbol: func_80204430
hints:
  - A run of `lwz`/`stw` that sweeps every offset of a struct in order is one
    whole-struct assignment, not separate field writes.
  - Loads come from `r4` (source), stores go to `r3` (destination); words move in
    pairs, with any leftover word moved on its own.
---

# One assignment, many loads and stores

PowerPC can't copy a struct in one instruction, so MWCC writes it out longhand. For
a small struct that means reading a word from the source, parking it at the same
offset in the destination, then doing it again one word along, all the way to the
end. You won't see `memcpy`; there's no call at all. Every load and store is right
there in the body.

Take a three-word glyph record with two pointers:

```c
typedef struct { u32 code; u32 w; u32 h; } Glyph;

void Glyph_copy(Glyph* out, Glyph* in) {
    *out = *in;
}
```

`out` is in `r3`, `in` in `r4`:

```asm
lwz   r5, 0(r4)    # in->code
lwz   r0, 4(r4)    # in->w
stw   r5, 0(r3)    # out->code
stw   r0, 4(r3)    # out->w
lwz   r0, 8(r4)    # in->h
stw   r0, 8(r3)    # out->h
blr
```

The pattern is pairs of words. Two loads land in `r5` and `r0`, two stores send
them home, and a leftover word with no partner gets its own load/store at the end
(`h`, the third one). Notice what the code doesn't say: no field names, just
offsets `0, 4, 8` sweeping all 12 bytes from one pointer to the other. When a block
of `lwz`/`stw` covers every byte of a struct from source to destination, it's a
struct assignment, not a column of hand-typed field copies.

What's below is the same move on a wider struct. Make sure the offsets blanket it
end to end, then fold it back to the assignment it always was.

## Your task

With the `Span` struct above, write `func_80204430` to reproduce the target
assembly.

<!-- solution -->
```c
void func_80204430(Span* dst, Span* src) {
    *dst = *src;
}
```

<!-- context -->
```c
typedef struct { u32 start; u32 end; u32 color; u32 flags; } Span;
```
