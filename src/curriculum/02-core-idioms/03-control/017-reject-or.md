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

A range *accepts* the inside with `&&`; the complement *rejects* the outside
with `||`. `x < lo || x > hi` is true when the value escapes either bound, so the
first half that holds already decides the answer — and that's exactly where `||`
short-circuits. Watch how the two compares can even use different forms.

Consider `rejected(x, lo)`, true when `x` falls below a *variable* floor or above
a fixed ceiling of 255:

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

The first operand compares two registers, so it's `cmpw`; the second compares
against a literal, so it's `cmpwi` — the operand kind chooses the form, exactly
as in the earlier compare lessons. With `||`, the *first passing* test jumps to
the reject path; only the last test falls through into accept. That asymmetry —
early operands branching to one label, the final operand to the other — is the
fingerprint of `||`.

Your target rejects with the same `||` shape but a different pair of bounds. Read
which compare jumps where to recover the two conditions and the value each path
returns.

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
