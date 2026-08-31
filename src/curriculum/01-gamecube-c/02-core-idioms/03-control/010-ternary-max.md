---
id: 169dfd39-eb13-5b2e-af43-d2fd4674f698
slug: control-ternary-max
title: Ternary Max
difficulty: 3
concepts:
  - ternary
  - comparison
  - select
symbol: func_801a77f4
hints:
  - "`a > b ? a : b` is max; expect a `cmpw` and a `ble-` skip."
  - Both arms merge through `mr r4, r3` / `mr r3, r4`.
---

# Selecting one of two values based on a comparison

A ternary `cond ? x : y` picking between the *same two input registers* lowers
to a compare, a conditional skip, and a pair of `mr` instructions that move the
chosen value into the return register.

```asm
cmpw r3, r4      # compare a, b (signed int)
ble- .else       # conditional skip
mr   r4, r3      # one arm: overwrite r4 with r3
.else:
mr   r3, r4      # merge: return whichever value is now in r4
blr
```

Walk the registers through it. `r3` holds `a` and `r4` holds `b` at the start.
Skip the branch and `mr r4, r3` overwrites `r4` with `a`, which the closing
`mr r3, r4` then carries out as the result. Take the branch and that overwrite
never runs — `b` stays where it already sat in `r4` and rides through to the
merge. The second `mr` exists only so both arms can leave through one `blr`.

The branch mnemonic carries the rest. Work out which case leaves `r4`
untouched — the case that keeps `b` — and you've found which arm returns `b`
versus `a`. The comparison the ternary needs follows from there.

## Your task

Write `func_801a77f4` to reproduce the assembly above.

<!-- solution -->
```c
int func_801a77f4(int a, int b) {
    return a > b ? a : b;
}
```
