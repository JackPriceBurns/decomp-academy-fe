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
  - "The shape tells you a constant is loaded, and the prose tells you its value. All that's left is the operation that uses it."
  - "The instructions are the same as in the worked example. Only the constant in the pool is different."
---

# When the bits aren't clean

The bit pattern of `0.9f` is `0x3F666666`, with nonzero bits in every hex
digit. One `lui` cannot build that, and a `lui`/`ori` pair plus the `mtc1`
move would cost three instructions. So IDO uses the second path. It stores the
constant in **`.rodata`**, the read-only data section, and *loads* it like any
other word. This is `tithe(x)`, which returns `x * 0.9f`:

```asm
 0:  lui   at, %hi([.rodata])         # upper half of the constant's address
 4:  lwc1  ft0, %lo([.rodata])(at)    # + lower half, and load it
 8:  mul.s fv0, fa0, ft0              # x * 0.9f
 c:  nop
10:  jr    ra
14:  nop
```

The `%hi(…)`/`%lo(…)` pair is new. The constant lives at a 32-bit address
that the linker has not chosen yet, so the assembler splits the address into
two halves. `lui` sets the top half, and the bottom half goes in the load's
offset field. This is the same idea as building a constant with
`lui`/`ori`, applied to an address. You will get the full details when
globals come up in the next tier. For now, remember this: **`lui at, %hi` +
`lwc1 %lo(…)(at)` means "load a float constant from the pool."** The pool is
the area of `.rodata` where these constants are stored.

Note what the listing *doesn't* show you: the value. The pool slot has no
name, only `[.rodata]`, and its contents are stored outside the code. In a
real project you would look in the data section and read the word there. In
these lessons, the prose gives you the value whenever the target uses this
path.

So there are two paths. Clean bits use `lui` + `mtc1`. Other bits use a
`%hi`/`%lo` + `lwc1` load. The path you see tells you what *kind* of constant
to expect, even before you know its value.

The target has the same structure, and the word in its pool slot is `1.1f`.
What remains is reading the operation.

## Your task

Write `func_802cb064` to reproduce the target assembly.

<!-- solution -->
```c
f32 func_802cb064(f32 x) {
    return x * 1.1f;
}
```
