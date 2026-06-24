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
cmpw  r3, r4      # signed compare: treats r3, r4 as signed
li    r3, 200     # else value
bgelr-            # if a >= b, return 200
li    r3, 100     # then value
blr
```

`cmpw` orders operands the way you'd expect for signed numbers: `-1` is *less
than* `1`. The condition test `bgelr` ("branch if greater-or-equal") reads the
signed ordering. This lesson is one half of a pair — the next swaps the types to
unsigned and watches the opcode change.

## Your task

Write `pick_signed` taking two signed `int`s: return `100` if `a < b`,
otherwise `200`.

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
