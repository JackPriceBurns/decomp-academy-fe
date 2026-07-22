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
symbol: Span_copy
hints:
  - A run of `lwz`/`stw` that sweeps every offset of a struct in order is one
    whole-struct assignment, not separate field writes.
  - Loads come from `r4` (source), stores go to `r3` (destination); words move in
    pairs, with any leftover word moved on its own.
---

# One assignment, many loads and stores

PowerPC won't copy a struct in one instruction, so MWCC does the next best thing.
It writes the copy out longhand. For a small struct that means reading a word
from the source, parking it at the same offset in the destination, then doing it
again one word along, all the way to the end. You won't spot a `memcpy` anywhere,
because there isn't a call at all. Every load and store is sitting right there in
the body.

Take a three-word glyph record handed two pointers:

```c
typedef struct { u32 code; u32 w; u32 h; } Glyph;

void Glyph_copy(Glyph* out, Glyph* in) {
    *out = *in;
}
```

`out` arrives in `r3`, `in` in `r4`, and MWCC gives you:

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
them home, and a leftover word with no partner gets its own load and store at the
back (that's `h`, the third one). The thing to notice is everything the code
doesn't say. No field by name, ever. Offsets `0, 4, 8` and nothing else, sweeping
all 12 bytes from one pointer over to the other. Once a block of `lwz`/`stw`
lands on **every** byte of a struct, source to destination, you've found a struct
assignment, not a column of field copies somebody typed out by hand.

What's below is the same move on a wider struct. Make sure the offsets blanket it
end to end, then fold it back down to the assignment it always was.

## Your task

With the `Span` struct above, write `Span_copy` to reproduce the target assembly.

<!-- solution -->
```c
void Span_copy(Span* dst, Span* src) {
    *dst = *src;
}
```

<!-- context -->
```c
typedef struct { u32 start; u32 end; u32 color; u32 flags; } Span;
```
