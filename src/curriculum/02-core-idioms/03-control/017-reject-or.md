---
id: control-reject-or
title: Rejecting Out-of-Range with ||
difficulty: 3
concepts:
  - short-circuit
  - range
  - boolean
  - combining
symbol: in_bounds
hints:
  - "`||` short-circuits the other way: the first *passing* test jumps to the
    reject exit."
  - Mixing a register-vs-register compare with a register-vs-immediate compare is
    fine — `cmpw` then `cmpwi`.
---

# The complement: || rejects

Where a range *accepts* what's inside with `&&`, the complement *rejects* what's
outside with `||`. Write `x < lo || x > hi` and it's true the moment the value
escapes either bound, so the first half to hold settles the whole thing. That's
the spot where `||` short-circuits. And keep an eye on the two compares here,
because they don't even have to share a form.

Take `rejected(x, lo)`. It's true when `x` dips below a *variable* floor, or
climbs above a fixed ceiling of 255.

```asm
cmpw  r3,r4        # x vs lo (both registers -> cmpw)
blt-  .reject      # x < lo -> already rejected, short-circuit
cmpwi r3,255       # x vs the fixed ceiling
ble-  .accept      # x <= 255 -> inside, fall through to accept
.reject:
li    r3,1
blr
.accept:
li    r3,0
blr
```

Two registers in the first compare, so it's `cmpw`. A literal in the second, so
it's `cmpwi`. The operand kind picks the form, same rule as the earlier compare
lessons. Now for the `||` twist. The *first passing* test jumps off to the
reject path, and only the final test falls through into accept. Early operands
head for one label, the last one for the other. That lopsided shape is how you
fingerprint an `||`.

Your target rejects with that same `||` skeleton, just a different pair of
bounds. Trace which compare jumps where, and you'll pull out both conditions plus
the value waiting on each path.

## Your task

Write `in_bounds`, taking an index `i` and a length `n`, to reproduce the
assembly above.

<!-- starter -->
```c
int in_bounds(int i, int n) {
    return 0;
}
```

<!-- solution -->
```c
int in_bounds(int i, int n) {
    if (i < 0 || i >= n) return 0;
    return 1;
}
```
