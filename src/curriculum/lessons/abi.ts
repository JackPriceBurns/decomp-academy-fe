import { LessonSource } from "@/lib/lessons/types";

export const abi: LessonSource[] = [
  {
    id: "abi-arg-registers",
    chapter: "abi",
    order: 1,
    title: "The Integer Argument Registers",
    difficulty: 1,
    concepts: ["calling-convention", "registers", "arguments"],
    brief: `
# Where the arguments live

The GameCube ABI hands the first eight integer (or pointer) arguments to a
function in registers **\`r3\`, \`r4\`, \`r5\`, \`r6\`, \`r7\`, \`r8\`, \`r9\`, \`r10\`** — in
that order. The first argument is in \`r3\`, the second in \`r4\`, and so on.

A function that simply returns its **fourth** argument therefore just copies
\`r6\` into the return register \`r3\`:

\`\`\`asm
mr   r3, r6      # r3 = the 4th argument
blr
\`\`\`

\`mr\` ("move register") is \`r3 = r6\`. The other three arguments arrive in
\`r3\`–\`r5\` but go unused, so they generate no code at all. Knowing the
argument-to-register mapping by heart lets you read any function signature
straight off its first few instructions.

## Your task

Write \`fourth\`, taking four \`int\`s and returning the **fourth** one (\`d\`).
`,
    symbol: "fourth",
    starter: `int fourth(int a, int b, int c, int d) {
    return 0;
}
`,
    solution: `int fourth(int a, int b, int c, int d) {
    return d;
}
`,
    hints: [
      "Arguments map to r3, r4, r5, r6 in order — the 4th is in r6.",
      "`return d;` copies r6 into r3: `mr r3, r6`.",
    ],
  },
  {
    id: "abi-fifth-arg",
    chapter: "abi",
    order: 2,
    title: "Reaching the Fifth Argument",
    difficulty: 1,
    concepts: ["calling-convention", "registers", "arguments"],
    brief: `
# Counting up to r7

The mapping keeps going past the first few registers. The fifth integer
argument lives in **\`r7\`** (r3=1st, r4=2nd, r5=3rd, r6=4th, r7=5th). A function
that adds its first and fifth arguments reads exactly that:

\`\`\`asm
add  r3, r3, r7   # 1st arg + 5th arg
blr
\`\`\`

The compiler never moved anything into place — \`a\` was already in \`r3\` and \`e\`
was already in \`r7\`, so a single \`add\` does the whole job. When you see an
operation between \`r3\` and \`r7\` with nothing loaded first, it's almost always
the 1st and 5th parameters.

The pattern continues all the way through \`r10\`: that's the full integer
argument range, \`r3\`–\`r10\`, holding exactly eight arguments. A ninth argument
has no register left and must spill to the stack — a case you'll meet later.

## Your task

Write \`pick5\`, taking five \`int\`s, so it compiles to the \`add\` above.
`,
    symbol: "pick5",
    starter: `int pick5(int a, int b, int c, int d, int e) {
    return 0;
}
`,
    solution: `int pick5(int a, int b, int c, int d, int e) {
    return a + e;
}
`,
    hints: [
      "The 5th argument arrives in r7.",
      "`a + e` is `add r3, r3, r7` with no setup needed.",
    ],
  },
  {
    id: "abi-float-args",
    chapter: "abi",
    order: 3,
    title: "Floats Use Their Own Registers",
    difficulty: 1,
    concepts: ["calling-convention", "floating-point", "registers"],
    brief: `
# A separate file for floating point

Floating-point arguments do **not** share the \`r3\`–\`r10\` integer registers.
They have their own bank: the first eight \`float\`/\`double\` arguments go in
**\`f1\`, \`f2\`, … \`f8\`**, and a floating-point result comes back in **\`f1\`**.

Single-precision \`f32\` math uses the \`...s\` ("single") forms, so summing three
floats is two \`fadds\`:

\`\`\`asm
fadds f0, f1, f2   # a + b  (into scratch f0)
fadds f1, f3, f0   # + c, result in the return reg f1
blr
\`\`\`

The compiler uses \`f0\` as its float scratch register — it is caller-saved and
the compiler reaches for it first when it needs a temporary. Notice the final
result lands in \`f1\`, the float return register — the mirror of \`r3\` on the
integer side.

## Your task

Write \`fadd3\`, taking three \`f32\`s, to match the target assembly above.
`,
    symbol: "fadd3",
    starter: `f32 fadd3(f32 a, f32 b, f32 c) {
    return 0.0f;
}
`,
    solution: `f32 fadd3(f32 a, f32 b, f32 c) {
    return a + b + c;
}
`,
    hints: [
      "Float arguments arrive in f1, f2, f3; the float result returns in f1.",
      "Single-precision add is `fadds`; expect two of them, ending in f1.",
    ],
  },
  {
    id: "abi-leaf-function",
    chapter: "abi",
    order: 4,
    title: "A Leaf Has No Stack Frame",
    difficulty: 2,
    concepts: ["stack-frame", "leaf", "prologue"],
    brief: `
# The cheapest function shape

A **leaf** function is one that calls nothing. Because it makes no calls, it
never has to preserve the **link register** (the return address) and it needs no
scratch storage that outlives a call — so MWCC gives it **no stack frame at
all**. There is no prologue and no epilogue; the body runs and returns:

\`\`\`asm
mullw r3, r3, r4   # a * b
addi  r3, r3, 1    # + 1
blr                # return — no stack adjustment anywhere
\`\`\`

Compare this to what you'll see next lesson. The complete absence of
\`stwu r1,...\` / \`mflr\` / \`mtlr\` is the signature of a leaf: everything happens
in volatile registers (\`r0\`, \`r3\`–\`r12\`, \`f0\`–\`f13\`) that a function may freely
clobber, then \`blr\`. (\`r0\` is volatile too — it's caller-saved, which is why
non-leaf prologues can use it as scratch to shuffle the link register without
ever preserving \`r0\` itself.)

## Your task

Write \`leaf\`, taking two \`int\`s, to reproduce the assembly above. It calls nothing, so
expect no stack frame.
`,
    symbol: "leaf",
    starter: `int leaf(int a, int b) {
    return 0;
}
`,
    solution: `int leaf(int a, int b) {
    return a * b + 1;
}
`,
    hints: [
      "This function calls nothing, so it is a leaf with no stack frame.",
      "Expect just `mullw`, `addi`, `blr` — no prologue or epilogue.",
    ],
  },
  {
    id: "abi-stack-frame",
    chapter: "abi",
    order: 5,
    title: "The Stack Frame and the Link Register",
    difficulty: 2,
    concepts: ["stack-frame", "prologue", "epilogue", "link-register", "calls"],
    brief: `
# What it costs to call another function

The moment a function **calls** something, its shape changes completely. A call
(\`bl\`) overwrites the **link register** \`lr\` with the address to come back to —
so before our function can call out, it must save its *own* return address
somewhere safe. That somewhere is a **stack frame**.

\`\`\`asm
stwu r1, -16(r1)   # PROLOGUE: push a 16-byte frame (r1 is the stack pointer)
mflr r0            # r0 = our return address (the link register)
stw  r0, 20(r1)    # save it into the caller's frame, above our own
bl   compute       # call compute(x) — this trashes lr, but we saved it
lwz  r0, 20(r1)    # EPILOGUE: reload our return address
addi r3, r3, 1     # compute(x) + 1
mtlr r0            # restore lr
addi r1, r1, 16    # pop the frame
blr                # return
\`\`\`

Every non-leaf function wears this prologue/epilogue. \`stwu r1, -N(r1)\` both
allocates the frame and links it to the caller's; \`mflr\`/\`stw\` save the return
address on the way in; \`lwz\`/\`mtlr\`/\`addi r1\` undo it all on the way out. Learn
to read past this boilerplate to find the real work in the middle.

After \`stwu r1, -16(r1)\`, the new \`r1\` points 16 bytes below where it started,
and the frame is laid out like this:

\`\`\`text
20(r1)  LR save slot (in the caller's frame)  <- our return address goes here
16(r1)  caller's back-chain word
12(r1)  saved-register slot (used in later lessons)
 8(r1)  parameter area
 4(r1)  our own LR save slot (unused — leaf callees fill it)
 0(r1)  back-chain: points at the old r1 (= r1 + 16)
\`\`\`

That is why the return address is stored at \`20(r1)\`: it lives in the *caller's*
LR save slot, which sits \`16 + 4\` bytes above our new stack pointer.

## Your task

Write \`wrapper\`, which calls \`compute(x)\` and returns its result **plus one**.
\`compute\` is declared for you. Expect a full prologue and epilogue around the
\`bl\`.
`,
    symbol: "wrapper",
    context: `extern int compute(int x);
`,
    starter: `int wrapper(int x) {
    return 0;
}
`,
    solution: `int wrapper(int x) {
    return compute(x) + 1;
}
`,
    hints: [
      "Calling `compute` makes this a non-leaf, so it needs a stack frame.",
      "Look for `stwu r1,-16(r1)` / `mflr` / `stw r0,20(r1)` on entry and the mirror on exit, with `addi r3,r3,1` after the `bl`.",
    ],
  },
  {
    id: "abi-arg-marshalling",
    chapter: "abi",
    order: 6,
    title: "Marshalling Arguments for a Call",
    difficulty: 2,
    concepts: ["calling-convention", "calls", "arguments"],
    brief: `
# Filling r3, r4, … before you branch

To call a function you must place its arguments into the same \`r3\`, \`r4\`, \`r5\`…
slots the callee will read. This is **argument marshalling**. When you call
\`combine(x, x + 1)\`, the compiler must get \`x\` into \`r3\` and \`x + 1\` into \`r4\`
before the \`bl\`:

\`\`\`asm
stwu r1, -16(r1)
mflr r0
addi r4, r3, 1     # r4 = x + 1  (the 2nd argument)
stw  r0, 20(r1)    # save our return address (no move needed for r3 — see below)
bl   combine       # combine(x, x + 1)
... epilogue ...
blr
\`\`\`

Crucially, \`x\` arrived in \`r3\` and the *first* argument also goes in \`r3\`, so it
needs no move — the compiler computes the second argument into \`r4\` and leaves
\`r3\` alone. The result of \`combine\` comes back in \`r3\`, which is already where
our own return value belongs, so the epilogue can return it directly.

## Your task

Write \`forward\`, which calls \`combine\` with the arguments marshalled as shown above. \`combine\` is declared for
you.
`,
    symbol: "forward",
    context: `extern int combine(int a, int b);
`,
    starter: `int forward(int x) {
    return 0;
}
`,
    solution: `int forward(int x) {
    return combine(x, x + 1);
}
`,
    hints: [
      "The two call arguments must land in r3 and r4 before the `bl`.",
      "`x` is already in r3; the compiler builds `x + 1` into r4 with `addi r4, r3, 1`.",
    ],
  },
  {
    id: "abi-saved-registers",
    chapter: "abi",
    order: 7,
    title: "Surviving a Call: Saved Registers",
    difficulty: 3,
    concepts: ["saved-registers", "calls", "register-allocation"],
    brief: `
# Values that must outlive a call

A function call may clobber any **volatile** register (\`r3\`–\`r12\`). So if a value
has to still be around *after* a call returns, the compiler can't leave it in a
volatile register — it moves it into a **non-volatile** (callee-saved) register,
\`r14\`–\`r31\`, which the ABI promises any callee will preserve. MWCC fills these
from the top down, so the first such value goes in **\`r31\`**.

Here \`y\` must survive the \`side(x)\` call so it can be returned afterwards:

\`\`\`asm
stwu r1, -16(r1)
mflr r0
stw  r0, 20(r1)
stw  r31, 12(r1)   # save caller's r31 in the saved-register slot at 12(r1)
mr   r31, r4       # park y (r4) in non-volatile r31
bl   side          # side(x)# r3..r12 may be destroyed, but r31 is safe
mr   r3, r31       # recover y for the return value
lwz  r31, 12(r1)   # restore the caller's r31
... epilogue ...
blr
\`\`\`

Two new instructions join the prologue/epilogue: \`stw r31, 12(r1)\` saves the
incoming value of \`r31\` (so we can hand it back untouched), and the matching
\`lwz r31, 12(r1)\` restores it. Seeing a \`stw r31\` paired with a \`mr r31, ...\`
right before a \`bl\` tells you a value is being preserved across the call.

## Your task

Write \`keep\`, which calls \`side(x)\` (ignoring its result) and then returns \`y\`.
\`side\` is declared for you. \`y\` must survive the call, so watch it land in
\`r31\`.
`,
    symbol: "keep",
    context: `extern int side(int x);
`,
    starter: `int keep(int x, int y) {
    return 0;
}
`,
    solution: `int keep(int x, int y) {
    side(x);
    return y;
}
`,
    hints: [
      "`y` is needed after the call, so it can't stay in a volatile register.",
      "Expect `stw r31,12(r1)` / `mr r31, r4` before the `bl`, and `mr r3, r31` after.",
    ],
  },
  {
    id: "abi-declaration-order",
    chapter: "abi",
    order: 8,
    title: "Declaration Order Colors the Registers",
    difficulty: 3,
    concepts: ["saved-registers", "register-allocation", "declaration-order"],
    brief: `
# A rule that decides r31 vs r30

When **two** values must survive calls, both get non-volatile homes — the first
in \`r31\`, the second in \`r30\` (MWCC allocates downward from the top). Which
value is "first"? It is set by the **order the locals are declared** in your C:
the first-declared surviving local takes the highest register, \`r31\`.

In \`order_demo\`, \`first\` is declared before \`second\`:

\`\`\`asm
stw  r31, 12(r1)
stw  r30, 8(r1)
mr   r30, r4         # y parked for the second call
bl   transform       # first = transform(x)
mr   r31, r3         # first -> r31  (declared first -> highest reg)
mr   r3, r30
bl   transform       # second = transform(y)
subf r3, r3, r31     # first - second
\`\`\`

The snippet above is the real output for the solution: \`first\`, declared first,
lands in \`r31\` (via \`mr r31, r3\` after its call), and the final \`subf\` reads
\`first - second\` as \`subf r3, r3, r31\`.

Now the decompiler's lever: **if the target had \`first\` in r30 and \`second\` in
r31, you'd simply swap the two declarations.** Reordering
\`int first; int second;\` to \`int second; int first;\` flips their register
homes — \`second\` would take \`r31\` and \`first\` would take \`r30\`, leaving the
result \`first - second\` unchanged (the two \`transform\` calls are independent, so
only their order shifts). The swapped source compiles to the mirror image, with
\`second\` parked in \`r31\` and the subtraction reading \`subf r3, r31, r3\`:

\`\`\`asm
mr   r31, r3         # second -> r31  (now declared first -> highest reg)
...
subf r3, r31, r3     # first - second
\`\`\`

Register coloring you can't otherwise reach is often just a declaration-order
edit away.

## Your task

Write \`order_demo\`. Declare \`first = transform(x)\` first, then \`second =
transform(y)\`, and return \`first - second\`. \`transform\` is declared for you.
The first-declared local, \`first\`, should land in \`r31\`.
`,
    symbol: "order_demo",
    context: `extern int transform(int v);
`,
    starter: `int order_demo(int x, int y) {
    return 0;
}
`,
    solution: `int order_demo(int x, int y) {
    int first = transform(x);
    int second = transform(y);
    return first - second;
}
`,
    hints: [
      "Both results survive a call, so they go in r31 and r30.",
      "Declaration order decides which: `first` is declared first, so it takes r31; swapping the two declarations would swap the registers.",
    ],
  },
  {
    id: "abi-tail-call",
    chapter: "abi",
    order: 9,
    title: "Returning a Called Result Directly",
    difficulty: 3,
    concepts: ["calls", "return-value", "calling-convention"],
    brief: `
# When the result is already in the right place

Sometimes a function does nothing but call another and hand back what it gets.
Because the callee leaves its result in \`r3\` — exactly where our own return
value must be — there is no shuffling to do between the call and the return:

\`\`\`asm
stwu r1, -16(r1)
mflr r0
stw  r0, 20(r1)
bl   helper        # helper(x)# result lands in r3
lwz  r0, 20(r1)
mtlr r0
addi r1, r1, 16
blr                # r3 already holds helper(x)
\`\`\`

This still isn't a leaf — the \`bl\` forces the full frame so the link register
survives — but the *body* is just the call. There's no \`mr\` to move the result
into place, because \`helper\`'s return register and \`call_it\`'s return register
are the same \`r3\`. The argument \`x\` likewise passes straight through \`r3\`
untouched.

Note this is **not** a tail call in the optimized sense: MWCC GC/2.0 does not
do tail-call elimination, so you always get the full prologue/epilogue around
the \`bl\` and a \`blr\` to return — never a bare \`b helper\` that reuses the
caller's frame. Don't go looking for that pattern; this compiler never emits it.

## Your task

Write \`call_it\` to match the target. \`helper\` is declared for you. Expect
the call surrounded only by the prologue and epilogue.
`,
    symbol: "call_it",
    context: `extern int helper(int x);
`,
    starter: `int call_it(int x) {
    return 0;
}
`,
    solution: `int call_it(int x) {
    return helper(x);
}
`,
    hints: [
      "`x` passes through r3 into the call, and the result returns in r3.",
      "No `mr` is needed around the `bl` — just the prologue/epilogue boilerplate.",
    ],
  },
  {
    id: "abi-stack-args",
    chapter: "abi",
    order: 10,
    title: "When Arguments Spill to the Stack",
    difficulty: 4,
    concepts: ["calling-convention", "stack-frame", "arguments"],
    brief: `
# The ninth argument has no register

Only the first **eight** integer arguments get registers (\`r3\`–\`r10\`). A
**ninth** argument has nowhere left to go, so the caller places it on the
**stack**, and the callee reads it back from there. The EABI lays out the
caller's frame as \`0(r1)\` = back-chain, \`4(r1)\` = LR save slot, and \`8(r1)\`
onward = the outgoing parameter area. Because \`ninth\` is a leaf and never
allocates its own frame, its \`r1\` on entry still points at the caller's frame —
so the ninth argument is right there at \`8(r1)\`:

\`\`\`asm
lwz  r3, 8(r1)    # load the 9th argument from the caller's frame
blr
\`\`\`

This function is still a leaf — it makes no call, so it needs no frame of its
own — yet it touches \`r1\` to fetch an argument that never fit in a register.
A lone \`lwz\` from a small positive \`r1\` offset at the very top of a function is
the classic tell that a parameter spilled to the stack. Arguments one through
eight (\`a\`–\`h\`) arrived in \`r3\`–\`r10\` and, being unused, produce no code.

## Your task

Write \`ninth\`, taking nine \`int\`s and returning the **ninth** one (\`i\`). It
should load \`i\` from the stack with \`lwz r3, 8(r1)\`.
`,
    symbol: "ninth",
    starter: `int ninth(int a, int b, int c, int d, int e, int f, int g, int h, int i) {
    return 0;
}
`,
    solution: `int ninth(int a, int b, int c, int d, int e, int f, int g, int h, int i) {
    return i;
}
`,
    hints: [
      "Only the first 8 integer arguments get registers (r3-r10); the 9th spills to the stack.",
      "`return i;` loads the spilled argument: `lwz r3, 8(r1)`.",
    ],
  },
];
