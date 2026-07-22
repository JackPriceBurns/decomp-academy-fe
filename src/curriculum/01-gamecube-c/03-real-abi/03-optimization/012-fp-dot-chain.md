---
id: a4d57e8e-5794-554f-9139-3eb1ad165dcf
slug: optimization-fp-dot-chain
title: "Chaining: FP Scheduling and fp_contract at Arity Three"
difficulty: 4
concepts:
  - scheduling
  - fp_contract
  - floating-point
  - chaining
symbol: dot3
hints:
  - A sum of products contracts into one `fmuls` seeded by the first term, then an
    `fmadds` per additional term — count the terms by counting the fused ops.
  - Write the dot product as one flat expression; the scheduler decides when each
    `lfs` issues, so don't try to force a load order with temporaries.
---

# The fp pair, scaled up a term

Two passes from earlier in the chapter meet here. In lesson 6 the scheduler
braided together the loads of a **two**-term dot product. In lesson 7
`fp_contract` glued a multiply-then-add into one `fmadds`. Neither knows about the
other, yet any sum of products sets both off. Bump up to a **larger arity** and
the shape settles into something you can predict. The first product comes out as
a bare `fmuls`, each term after it rolls in as an `fmadds`, and the scheduler
keeps reshuffling the `lfs` loads so their latencies hide behind the math.

Cast your mind back to the two-term version from lesson 6, `proj(f32 *u, f32 *w)`:

```asm
lfs    f1, 4(r3)      # loads interleaved by the scheduler
lfs    f0, 4(r4)
lfs    f2, 0(r3)
fmuls  f0, f1, f0     # first product (fp_contract leaves this as a plain fmuls)
lfs    f1, 0(r4)
fmadds f1, f2, f1, f0 # second term fused into a multiply-add
blr
```

An `fmuls` and a single `fmadds` mean two terms. Tack on a third and nothing
surprising happens; you get one more `fmadds` and two more `lfs`, the whole thing
re-scheduled around them. So count the fused FP ops to get the term count, and
read the load offsets to see which array elements pair off against each other.

Your `dot3` is one notch larger. Use the `lfs` offsets to work out how many
elements from each array take part and how they line up, then put the dot product
down as one flat expression and leave the fusing to `fp_contract` and the
interleaving to the scheduler.

## Your task

Write `dot3(f32 *a, f32 *b)` to reproduce the target assembly — a sum of
element-wise products with the loads scheduled and the additions contracted into
`fmadds`.

<!-- solution -->
```c
f32 dot3(f32 *a, f32 *b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}
```
