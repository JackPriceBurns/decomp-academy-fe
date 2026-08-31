---
id: c6a9d3d9-f36b-5094-9604-60af4b154b9b
slug: bitwise-shift-variable
title: Shifting by a Variable Amount
difficulty: 3
concepts:
  - bitwise
  - shifts
  - variable-shift
  - slw
symbol: func_801aa74c
hints:
  - A runtime shift amount can't fold into `rlwinm` — it uses the register-form
    shift.
  - "`x << n` with `n` in a register compiles to `slw r3, r3, r4`."
---

# When the shift count is a register

Up to now every shift moved by a *constant*, which is why MWCC could fold the
count into an `rlwinm` (`slwi`/`srwi`) or an `srawi`. A *runtime* amount leaves
nothing to fold. PowerPC keeps separate register-shift opcodes for that case,
each reading its count out of a second register. Here's a logical right shift
by a variable amount:

```asm
srw     r3,r3,r4
blr
```

Three of these track the constant forms by sign: `slw` shifts left, `srw`
shifts right logically for unsigned values, and `sraw` shifts right
algebraically for signed ones. The signed-versus-unsigned rule hasn't changed —
the one new wrinkle is that the count rides in a register instead of inside the
instruction.

Spot any of `slw`/`srw`/`sraw` with no trailing `i` and you know the shift
distance came from a variable in the source. Take the direction and sign
straight from the mnemonic, and let the second argument carry the count.

## Your task

Write `func_801aa74c` to match the target.

<!-- solution -->
```c
int func_801aa74c(int x, int n) {
    return x << n;
}
```
