---
id: 4b2c1928-ba8d-40af-bb3c-6911d00e5f54
slug: floats-rodata-constants
title: "Float Constants II: Loaded From .rodata"
difficulty: 2
concepts:
  - floats
  - constants
  - rodata
  - hi-lo
symbol: func_802cb064
hints:
  - "The shape tells you a constant is loaded; the prose tells you its value. All that's left is the operation consuming it."
  - "Same skeleton as the worked example — only the constant in the pool differs."
---

# When the bits aren't clean

`0.9f`'s bit pattern is `0x3F666666` — junk in every hex digit. No
single `lui` can build that, and a `lui`/`ori` pair plus the ferry
would cost three instructions. So IDO takes the second path: it parks
the constant in **`.rodata`** — the read-only data section — and
*loads* it like any other word. Here's `tithe(x)`, which returns
`x * 0.9f`:

```asm
 0:  lui   at, %hi([.rodata])         # upper half of the constant's address
 4:  lwc1  ft0, %lo([.rodata])(at)    # + lower half, and load it
 8:  mul.s fv0, fa0, ft0              # x * 0.9f
 c:  nop
10:  jr    ra
14:  nop
```

The `%hi(…)`/`%lo(…)` pair is new: the constant lives at some 32-bit
address the linker hasn't picked yet, so the assembler splits the
address into halves — `lui` installs the top, and the bottom rides
along inside the load's offset. It's the address cousin of the
`lui`/`ori` constant trick, and you'll get the full story when
globals arrive next tier. For now: **`lui at, %hi` + `lwc1 %lo(…)(at)`
means "load a float constant from the pool."**

Notice what the listing *doesn't* tell you: the value. The pool slot
is anonymous — `[.rodata]` — and its contents live outside the code.
In a real project you'd flip to the data section and read the word;
in these lessons, the prose will hand you the value whenever the
target uses this path.

So the two paths, side by side: clean bits → `lui` + `mtc1` ferry;
messy bits → `%hi`/`%lo` + `lwc1` load. Which one appears tells you
what *kind* of constant to reach for before you know its value.

The target has the same skeleton, and the word in its pool slot is
`1.1f`. The rest is reading the operation.

## Your task

Write `func_802cb064` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_802cb064(f32 x) {
    return x * 1.1f;
}
```
