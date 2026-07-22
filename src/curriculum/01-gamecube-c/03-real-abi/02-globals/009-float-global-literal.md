---
id: d91a8bfd-0116-5b74-9eee-d0efe8e94e01
slug: globals-float-global-literal
title: "A Float Global Times a Pooled Literal"
difficulty: 3
concepts:
  - globals
  - sda21
  - literal-pool
  - float
  - chaining
symbol: applyDrag
hints:
  - Two lfs loads — one is the named float global, one is the pooled literal (an
    @N symbol) — then an fmuls, then an stfs back to a third float global.
  - The reloc name tells the two loads apart - a real name versus a synthetic
    @N. Their FPR order is just scheduling.
---

# Two `lfs` loads, only one is a global

Two pieces of this are already familiar from earlier. A float global reads as an
`lfs` of a named symbol. Pool a float literal as an `@N` constant and it reads as
an `lfs` too, just of a synthetic symbol instead. Once both land in one
expression, you're staring at *two* `lfs` loads that are nearly twins, and the
relocation name is the one thing that pries them apart. One came from a global you
wrote. The other is a compiler-minted `@N` label standing in for the constant.

With both values in FPRs, an `fmuls` does the multiply and an `stfs` sends the
single-precision result back to the destination float global. The suffix still
bites, just as the literal lesson flagged. Drop the `f` and a bare `0.5` is a
`double`, which lifts the expression to double precision and gives you
`lfd`/`fmul`/`frsp`. The `f` is the only reason you stay on `lfs`/`fmuls`/`stfs`.

Here's `spin()`, which multiplies the float global `gAngle` by `1.5f` and stashes
the result in `gWobble`:

```asm
lfs   f1, @5@sda21(r2)      # load the pooled literal 1.5f
lfs   f0, gAngle@sda21(r2)  # load the float global gAngle
fmuls f0, f1, f0           # gAngle * 1.5f
stfs  f0, gWobble@sda21(r2) # gWobble = result
blr
```

Both loads come through `r2`, the `.sdata2` base from the read-float lesson, and
yet `@5` is the constant where `gAngle` is the real global. Your target does the
same multiply-then-store over a *different* float global and a *different*
literal. The two reloc names and the literal's value are all there in the
disassembly.

## Your task

The globals are declared for you: `gVelocity` and `gScaled` (both `f32`). Write
`applyDrag` (no arguments, no return) to reproduce the assembly above.

<!-- solution -->
```c
void applyDrag(void) {
    gScaled = gVelocity * 0.75f;
}
```

<!-- context -->
```c
extern f32 gVelocity;
extern f32 gScaled;
```
