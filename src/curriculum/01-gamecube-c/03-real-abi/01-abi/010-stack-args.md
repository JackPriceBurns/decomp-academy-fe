---
id: 3d9c08a8-36d6-5ee9-a92c-312b97255ee8
slug: abi-stack-args
title: When Arguments Spill to the Stack
difficulty: 4
concepts:
  - calling-convention
  - stack-frame
  - arguments
symbol: ninth
hints:
  - Only the first 8 integer arguments get registers (r3-r10); the 9th spills to
    the stack at `8(r1)`.
  - The single `lwz r3, 8(r1)` fetches the spilled argument — work out which
    parameter position it is and return it.
---

# Argument nine has to ride the stack

The register budget for integer arguments runs out at **eight**, `r3`–`r10`.
Hand a function a **ninth** and there is simply no register left for it, so the
caller drops that one on the **stack** and the callee digs it back out. To find
it you lean on the EABI frame layout. The first two words of the caller's frame
are spoken for, `0(r1)` for the back-chain and `4(r1)` for a saved LR, and the
outgoing parameter area starts right after at `8(r1)`. Since `ninth` is a leaf,
it builds no frame of its own, so on entry `r1` is still aimed at the caller's
frame. That leaves the ninth argument an easy grab at `8(r1)`:

```asm
lwz  r3, 8(r1)    # load the 9th argument from the caller's frame
blr
```

Notice it is still a leaf. No call means no frame, yet it reaches into `r1`
anyway to grab the one argument that never landed in a register. When you spot a
lone `lwz` reading a small positive `r1` offset right at the top of a function,
that is the giveaway that an argument spilled onto the stack. The first eight
(`a`–`h`) showed up in `r3`–`r10`, and since nobody uses them, they emit
nothing.

## Your task

Write `ninth` to reproduce the assembly above — a single `lwz` from `8(r1)`
followed by `blr`.

<!-- solution -->
```c
int ninth(int a, int b, int c, int d, int e, int f, int g, int h, int i) {
    return i;
}
```
