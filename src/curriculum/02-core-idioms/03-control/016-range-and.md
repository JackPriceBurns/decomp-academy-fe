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

Back in lesson 11 we glued two operands together with `&&`. A **range test** is
the tidy special case of that. Both halves poke at the *same* value, just
against different bounds, `lo <= x && x <= hi`. It's still `&&`, so it still
short-circuits. The twist is that both compares now read one register, so you
watch a single value get probed twice.

Take `within_bounds(x)`, true exactly when `x` sits inside `[10, 20]`:

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

How do you spot a range check? Two `cmpwi`s on the *same register*, and both
failing branches drop to the *same* false exit. The first compare guards the low
bound, the second the high. Each one bails the instant the value slips past its
side. Reach `li r3,1` and you know both held.

The two constants are your bounds, inclusive or exclusive depending on the
branch. `blt` vs `ble`, `bgt` vs `bge`, that distinction is what tells you. From
there, rebuild the one `&&` expression that lets the `1` through.

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
