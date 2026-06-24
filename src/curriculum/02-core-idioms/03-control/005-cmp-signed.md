---
id: control-cmp-signed
title: "Signed Compare: cmpw"
difficulty: 2
concepts:
  - comparison
  - signed
  - branch
  - types
symbol: pick_signed
hints:
  - Signed `int` operands feeding a branch use `cmpw`.
  - Expect `cmpw r3, r4`, `li r3, 200`, `bgelr-`, `li r3, 100`.
---

# The type chooses the opcode

When a comparison feeds a branch, PowerPC has *two* compare instructions, and
the C **type** decides which one. For a signed `int`, MWCC emits **`cmpw`** —
the signed word compare:

```asm
cmpw  r3, r4      # signed word compare
li    r3, 200     # speculative load
bgelr-            # conditional return
li    r3, 100     # fall-through value
blr
```

`cmpw` orders operands the way you'd expect for signed numbers: `-1` is *less
than* `1`. The branch mnemonic encodes the *negation* of the taken condition.
In the pattern above, the branch exits on one side and the fall-through handles
the other — the two `li` constants give you the two possible return values.
This lesson is one half of a pair — the next swaps the types to unsigned and
watches the opcode change.

To reconstruct the C: figure out which condition causes the `bgelr-` to fire
(it exits early when that condition holds), then match the `li` values to the
two arms.

## Your task

Write `pick_signed`, taking two signed `int`s, to reproduce the assembly above.

<!-- starter -->
```c
int pick_signed(int a, int b) {
    return 0;
}
```

<!-- solution -->
```c
int pick_signed(int a, int b) {
    if (a < b) return 100;
    return 200;
}
```
