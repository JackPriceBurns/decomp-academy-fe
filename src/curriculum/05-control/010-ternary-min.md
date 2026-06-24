---
id: control-ternary-min
title: Ternary Min
difficulty: 3
concepts:
  - ternary
  - comparison
  - select
symbol: mini
hints:
  - "`a < b ? a : b` is min; the only change from max is `bge-` instead of
    `ble-`."
  - The `mr r4, r3` / `mr r3, r4` merge is the same as max.
---

# The mirror image

`a < b ? a : b` is `min(a, b)`, and the asm is the max idiom with one bit
flipped — the branch condition. Where max skipped on `ble-`, min skips on
`bge-`:

```asm
cmpw r3, r4
bge- .else       # if a >= b, keep b
mr   r4, r3      # a is smaller: stage it
.else:
mr   r3, r4
blr
```

The `mr`/`mr` merge is byte-for-byte identical to max; *only the condition code
in the branch differs* (`bge` vs `ble`). When you see this two-move shape after
a compare, the single branch condition tells you whether the original C was a
min or a max.

## Your task

Write `mini`, returning the smaller of two signed `int`s using a ternary.

<!-- starter -->
```c
int mini(int a, int b) {
    return 0;
}
```

<!-- solution -->
```c
int mini(int a, int b) {
    return a < b ? a : b;
}
```
