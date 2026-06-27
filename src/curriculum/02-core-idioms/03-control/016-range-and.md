---
id: control-range-and
title: A Range Test with &&
difficulty: 3
concepts:
  - short-circuit
  - range
  - boolean
  - combining
symbol: in_range
hints:
  - One value tested against two bounds is two compares on the *same* register.
  - Both `&&` failures branch to the same shared `li r3, 0` exit.
---

# Both bounds, one value, one &&

Lesson 11 joined two operands with `&&`. A **range test** is the special case
where both halves test the *same* value against different bounds: `lo <= x &&
x <= hi`. Because it's still `&&`, it still short-circuits — but now both
compares read the same register, so you'll see one value probed twice.

Consider `within_bounds(x)`, true exactly when `x` lies in `[10, 20]`:

```asm
cmpwi r3,10        # x vs the low bound
blt-  .false       # x < 10 -> out of range, short-circuit
cmpwi r3,20        # x vs the high bound
bgt-  .false       # x > 20 -> out of range
li    r3,1         # both bounds satisfied
blr
.false:
li    r3,0
blr
```

The tell-tale of a range check is two `cmpwi`s against the *same register* whose
failing branches both land on the *same* false exit. The first compare is the
lower bound, the second the upper; each branches away the moment the value
escapes that side. Only when both are satisfied does control reach the `li r3,1`.

Read the two constants as the inclusive-or-exclusive bounds (the branch
mnemonic — `blt` vs `ble`, `bgt` vs `bge` — tells you which), and rebuild the
single `&&` expression that gates the `1`.

## Your task

Write `in_range`, taking one `int`, to reproduce the assembly above.

<!-- starter -->
```c
int in_range(int x) {
    return 0;
}
```

<!-- solution -->
```c
int in_range(int x) {
    if (x >= 0 && x < 100) return 1;
    return 0;
}
```
