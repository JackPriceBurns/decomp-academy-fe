import { LessonSource } from "@/lib/lessons/types";

export const pointers: LessonSource[] = [
  {
    id: "pointers-deref",
    chapter: "pointers",
    order: 1,
    title: "Dereferencing a Pointer",
    difficulty: 1,
    concepts: ["loads", "pointers", "memory"],
    brief: `
# Reading from memory

A pointer is just an address sitting in a register. To read the value it points
at, PowerPC uses a **load**: \`lwz rD, off(rA)\` — *load word and zero* — fetches
the 32-bit word at \`rA + off\` into \`rD\`.

With the pointer arriving in \`r3\` and an offset of zero, \`*p\` is a single load:

\`\`\`asm
lwz  r3, 0(r3)    # r3 = *p
blr
\`\`\`

The \`0(r3)\` is the **base + displacement** addressing mode you'll see
everywhere: a register holding an address, plus a constant byte offset. Here the
displacement is \`0\` because we want the very first word.

## Your task

Write \`load_int\` to match the target assembly above.
`,
    symbol: "load_int",
    starter: `int load_int(int* p) {
    return 0;
}
`,
    solution: `int load_int(int* p) {
    return *p;
}
`,
    hints: [
      "The pointer arrives in r3; reading through it is a load.",
      "`*p` compiles to `lwz r3, 0(r3)`.",
    ],
  },
  {
    id: "pointers-store",
    chapter: "pointers",
    order: 2,
    title: "Storing Through a Pointer",
    difficulty: 1,
    concepts: ["stores", "pointers", "memory"],
    brief: `
# Writing to memory

The mirror image of a load is a **store**. \`stw rS, off(rA)\` — *store word* —
writes the 32-bit value in \`rS\` to the address \`rA + off\`. Note the operand
order: the *source register comes first*, the address second — the reverse of
how you read \`*p = v\` in C.

With the pointer in \`r3\` and the value in \`r4\`:

\`\`\`asm
stw  r4, 0(r3)    # *p = v
blr
\`\`\`

A store produces no result, so the function just returns. The same
base + displacement addressing mode from the load applies here too.

## Your task

Write \`store_int\` so it compiles to the \`stw\` above.
`,
    symbol: "store_int",
    starter: `void store_int(int* p, int v) {
}
`,
    solution: `void store_int(int* p, int v) {
    *p = v;
}
`,
    hints: [
      "Writing through a pointer is a store; the value is in r4.",
      "`*p = v` compiles to `stw r4, 0(r3)` — source register first.",
    ],
  },
  {
    id: "pointers-index-const",
    chapter: "pointers",
    order: 3,
    title: "A Constant Index Becomes a Displacement",
    difficulty: 2,
    concepts: ["loads", "addressing", "arrays"],
    brief: `
# The displacement field earns its keep

When you index a pointer with a *constant*, like \`p[2]\`, the compiler folds the
offset straight into the displacement field of the load. There's no separate
add. Since each \`int\` is 4 bytes, element 2 lives at byte offset \`2 * 4 = 8\`:

\`\`\`asm
lwz  r3, 8(r3)    # r3 = p[2]
blr
\`\`\`

This is the first place **element size** shows up: the C index \`2\` becomes the
byte displacement \`8\`. Reading disassembly, you divide back — a displacement of
\`8\` on an \`int*\` means index \`2\`.

## Your task

Write \`third\` to reproduce the assembly above.
`,
    symbol: "third",
    starter: `int third(int* p) {
    return 0;
}
`,
    solution: `int third(int* p) {
    return p[2];
}
`,
    hints: [
      "A constant index folds into the load's displacement — no extra add.",
      "`p[2]` on an int* is byte offset 8, so `lwz r3, 8(r3)`.",
    ],
  },
  {
    id: "pointers-store-index-const",
    chapter: "pointers",
    order: 4,
    title: "Writing at a Constant Index",
    difficulty: 2,
    concepts: ["stores", "addressing", "arrays"],
    brief: `
# Displacement stores

Storing at a constant index works exactly like the load did — the index scales
into a displacement, and a \`stw\` writes there. With \`p\` in \`r3\` and \`v\` in
\`r4\`, writing \`p[2]\` targets byte offset \`8\`:

\`\`\`asm
stw  r4, 8(r3)    # p[2] = v
blr
\`\`\`

Whenever you see a store (or load) with a non-zero constant displacement that's
a clean multiple of the element size, suspect an array or struct-field access in
the original C — *not* a hand-written pointer offset. The displacement \`8\` here
reads back as "the third \`int\`".

## Your task

Write \`set_third\` to match the target assembly above.
`,
    symbol: "set_third",
    starter: `void set_third(int* p, int v) {
}
`,
    solution: `void set_third(int* p, int v) {
    p[2] = v;
}
`,
    hints: [
      "Same displacement trick as the load, but writing.",
      "`p[2] = v` compiles to `stw r4, 8(r3)`.",
    ],
  },
  {
    id: "pointers-arith",
    chapter: "pointers",
    order: 5,
    title: "Pointer Arithmetic Is Scaled",
    difficulty: 2,
    concepts: ["pointers", "arithmetic", "scaling"],
    brief: `
# \`p + 3\` is not \`+ 3\`

Adding to a pointer doesn't add a raw number — it advances by **whole
elements**. For an \`int*\`, \`p + 3\` moves forward \`3 * 4 = 12\` bytes. With a
*constant* offset MWCC folds the scaled distance into an \`addi\`:

\`\`\`asm
addi r3, r3, 12   # p + 3, scaled by sizeof(int)
blr
\`\`\`

The result is the new address, returned in \`r3\`. This is why \`p + 3\` and
\`&p[3]\` are the same thing: both produce the address \`p + 12 bytes\`. The element
size silently multiplies every pointer offset you write. The decompilation
implication: since both forms emit identical assembly, you *can't* tell from the
output which one the author wrote — pick whichever reads more naturally in
context (\`&arr[i]\` for array-shaped data, \`p + n\` for pointer walks).

## Your task

Write \`advance3\` so it compiles to the \`addi\` above.
`,
    symbol: "advance3",
    starter: `int* advance3(int* p) {
    return p;
}
`,
    solution: `int* advance3(int* p) {
    return p + 3;
}
`,
    hints: [
      "Pointer math counts elements, not bytes: `p + 3` is +12 bytes for an int*.",
      "`p + 3` compiles to `addi r3, r3, 12`.",
    ],
  },
  {
    id: "pointers-index-var",
    chapter: "pointers",
    order: 6,
    title: "A Variable Index Needs Scaling Then Indexing",
    difficulty: 3,
    concepts: ["loads", "indexed-addressing", "scaling"],
    brief: `
# When the index is a register

A *constant* index folded into a displacement. A *variable* index can't — it
isn't known at compile time. The compiler must scale it at runtime, then use the
**indexed** load \`lwzx rD, rA, rB\`, which reads from \`rA + rB\` (two registers,
no displacement).

For an \`int*\`, the index is scaled by 4 with a shift-left-by-2 (\`slwi\`):

\`\`\`asm
slwi r0, r4, 2    # i * 4  (sizeof(int))
lwzx r3, r3, r0   # load p[i]
blr
\`\`\`

So \`slwi\` by 2 followed by \`lwzx\` is the signature of an \`int*\` indexed by a
variable. The shift amount tells you the element size: 2 → 4-byte elements.

One thing to recognize in the wild: \`slwi rA, rB, n\` is itself a simplified
mnemonic for \`rlwinm rA, rB, n, 0, 31-n\`. Disassemblers like objdump or Ghidra
often print the underlying \`rlwinm\` (here \`rlwinm r0, r4, 2, 0, 29\`) instead of
the friendlier \`slwi r0, r4, 2\` — they're the same shift.

## Your task

Write \`at\` to match the target assembly above.
`,
    symbol: "at",
    starter: `int at(int* p, int i) {
    return 0;
}
`,
    solution: `int at(int* p, int i) {
    return p[i];
}
`,
    hints: [
      "A variable index is scaled at runtime, then used with an indexed load.",
      "Expect `slwi r0, r4, 2` (i * 4) then `lwzx r3, r3, r0`.",
    ],
  },
  {
    id: "pointers-u8-array",
    chapter: "pointers",
    order: 7,
    title: "Byte Arrays Need No Shift",
    difficulty: 3,
    concepts: ["loads", "indexed-addressing", "u8"],
    brief: `
# Scale of one

(\`u8\` is the GameCube SDK's typedef for \`unsigned char\` — \`typedef unsigned
char u8;\` — and shows up everywhere in this codebase. The matching signed and
wider types are \`s8\`, \`u16\`/\`s16\`, \`u32\`/\`s32\`.)

The scaling factor *is* the element size. A \`u8\` is one byte, so scaling \`i\` by
1 is a no-op — there's no shift at all. The index register goes straight into
the indexed byte load \`lbzx rD, rA, rB\` (*load byte and zero*, indexed):

\`\`\`asm
lbzx r3, r3, r4   # r3 = p[i], zero-extended
blr
\`\`\`

\`lbzx\` zero-extends the byte into the full register, which is exactly what an
unsigned \`u8\` wants. When you only load and store a byte, \`u8\` is the natural
choice; using \`char\` would bring in a sign-extending \`extsb\` the compiler
wouldn't otherwise need. That gives you a diagnostic rule when reading
disassembly: \`lbzx\` (or \`lbz\`) *alone* with no following \`extsb\` is strong
evidence the original type was unsigned. An \`lbzx\` followed by \`extsb\` points to
a signed \`char\`/\`s8\` *being widened* — the \`extsb\` shows up only when a signed
byte is promoted to a wider type, so a signed byte kept narrow still loads with a
bare \`lbzx\`.

## Your task

Write \`byte_at\` so it compiles to the \`lbzx\` above.
`,
    symbol: "byte_at",
    starter: `u8 byte_at(u8* p, int i) {
    return 0;
}
`,
    solution: `u8 byte_at(u8* p, int i) {
    return p[i];
}
`,
    hints: [
      "Element size 1 means no scaling shift at all.",
      "`p[i]` on a u8* is a single `lbzx r3, r3, r4`.",
    ],
  },
  {
    id: "pointers-u16-array",
    chapter: "pointers",
    order: 8,
    title: "Halfword Arrays Shift by One",
    difficulty: 3,
    concepts: ["loads", "indexed-addressing", "u16", "sign"],
    brief: `
# Two bytes, shift by one — and sign matters

A \`u16\`/\`s16\` is two bytes, so the index is scaled by 2 (\`slwi\` by 1). The load
itself splits on **sign**: an unsigned \`u16\` zero-extends with \`lhzx\`, while a
signed \`s16\` sign-extends with \`lhax\` (*load halfword algebraic*, indexed).

For a signed \`s16*\`:

\`\`\`asm
slwi r0, r4, 1    # i * 2  (sizeof(s16))
lhax r3, r3, r0   # load p[i], sign-extended
blr
\`\`\`

Swap to \`u16\` and the only change is \`lhax\` → \`lhzx\`. The shift of 1 tells you
2-byte elements; the \`a\` vs \`z\` in the mnemonic tells you signed vs unsigned.

## Your task

Write \`half_at\` to match the target assembly above.
`,
    symbol: "half_at",
    starter: `s16 half_at(s16* p, int i) {
    return 0;
}
`,
    solution: `s16 half_at(s16* p, int i) {
    return p[i];
}
`,
    hints: [
      "Element size 2 → scale with `slwi` by 1.",
      "A signed s16 sign-extends: `slwi r0, r4, 1` then `lhax r3, r3, r0`.",
    ],
  },
  {
    id: "pointers-strlen",
    chapter: "pointers",
    order: 9,
    title: "Walking a String",
    difficulty: 3,
    concepts: ["loops", "pointers", "u8"],
    brief: `
# Advancing a pointer in a loop

A classic string walk reads bytes until it hits the NUL terminator, counting as
it goes. The compiler keeps the running pointer in \`r3\` and the count in \`r4\`,
bumping both with \`addi\` and re-checking the loaded byte against zero each
iteration:

\`\`\`asm
li      r4, 0          # count = 0
b       check
loop:
addi    r4, r4, 1      # count++
addi    r3, r3, 1      # s++
check:
lbz     r0, 0(r3)      # *s
cmplwi  r0, 0          # compare unsigned against 0
bne+    loop           # keep going while non-zero
mr      r3, r4         # return count
blr
\`\`\`

Note the loop tests at the *bottom* (the initial \`b\` jumps straight to the
check), and the unsigned compare \`cmplwi\` comes from the \`u8\` element type. The
\`+\` on \`bne+\` is a static branch hint predicting the back-edge is taken — loops
are expected to iterate, so MWCC marks the loop branch as likely. (Contrast the
\`beq-\` in the NULL-check lesson, where the early-out is marked *un*likely.)

## Your task

Write \`str_len\`, taking a \`u8* s\`, returning the number of bytes before the
terminating zero.
`,
    symbol: "str_len",
    starter: `int str_len(u8* s) {
    return 0;
}
`,
    solution: `int str_len(u8* s) {
    int n = 0;
    while (*s) {
        n++;
        s++;
    }
    return n;
}
`,
    hints: [
      "Loop loading `*s` with `lbz`, advancing `s` with `addi`, until the byte is 0.",
      "The u8 type makes the zero-test an unsigned `cmplwi r0, 0`.",
    ],
  },
  {
    id: "pointers-compare",
    chapter: "pointers",
    order: 10,
    title: "Comparing Two Pointers",
    difficulty: 4,
    concepts: ["pointers", "comparison", "boolean"],
    brief: `
# Equality without a branch

Two pointers are equal when their addresses are equal, so \`a == b\` is really an
integer equality. Returning that comparison as a \`BOOL\` (in the GameCube SDK
headers \`BOOL\` is just a typedef for \`int\`, with \`TRUE == 1\` and \`FALSE == 0\`,
so it carries no special compiler semantics) without branching, MWCC reaches for
a clever trick: subtract, then count leading zeros.

\`\`\`asm
subf   r0, r3, r4     # subf rD,rA,rB = rB - rA, i.e. r4 - r3 (zero iff equal)
cntlzw r0, r0         # count leading zero bits (32 iff the value was 0)
srwi   r3, r0, 5      # 32 >> 5 == 1# anything < 32 >> 5 == 0
blr
\`\`\`

\`cntlzw\` returns 32 only when its input is exactly zero; shifting that by 5
maps 32 → 1 and every other count → 0. So this three-instruction idiom is the
branchless "are these equal?" — recognize it as \`a == b\`.

## Your task

Write \`same\`, taking two \`int*\` and returning whether they point at the same
address.
`,
    symbol: "same",
    starter: `BOOL same(int* a, int* b) {
    return FALSE;
}
`,
    solution: `BOOL same(int* a, int* b) {
    return a == b;
}
`,
    hints: [
      "Pointer equality is address equality — write the plain `a == b`.",
      "The branchless form is `subf`, `cntlzw`, then `srwi r3, r0, 5`.",
    ],
  },
  {
    id: "pointers-null-check",
    chapter: "pointers",
    order: 11,
    title: "Guarding Against NULL",
    difficulty: 4,
    concepts: ["pointers", "branches", "null"],
    brief: `
# Branch on the pointer itself

A NULL check tests the pointer against zero before dereferencing. Since NULL is
address \`0\`, \`if (p)\` is an unsigned compare against \`0\` feeding a branch. When
it's zero, the function skips the load and returns \`0\`:

\`\`\`asm
cmplwi r3, 0          # p == NULL ?
beq-   ret0           # if so, jump to the zero return
lwz    r3, 0(r3)      # else *p
blr
ret0:
li     r3, 0          # return 0
blr
\`\`\`

The \`beq-\` carries a branch hint (the \`-\`) predicting the pointer is usually
*non*-NULL — MWCC assumes the early-out is the rare path. The \`-\`/\`+\` suffix is
a static prediction bit baked into the branch's encoding, not a condition
modifier: \`-\` marks the branch as *unlikely* taken, \`+\` as *likely*. You'll see
\`bne+\`, \`blt+\`, \`beq-\` and friends throughout real disassembly. Two \`blr\`s,
one per return path.

## Your task

Write \`safe_deref\`, taking an \`int* p\`, returning \`*p\` when \`p\` is non-NULL and
\`0\` otherwise.
`,
    symbol: "safe_deref",
    starter: `int safe_deref(int* p) {
    return 0;
}
`,
    solution: `int safe_deref(int* p) {
    if (p) {
        return *p;
    }
    return 0;
}
`,
    hints: [
      "`if (p)` is an unsigned compare of the pointer against 0.",
      "Expect `cmplwi r3, 0` / `beq-` guarding the `lwz`.",
    ],
  },
  {
    id: "pointers-swap",
    chapter: "pointers",
    order: 12,
    title: "Swapping Through Pointers",
    difficulty: 3,
    concepts: ["loads", "stores", "pointers"],
    brief: `
# Two loads, two stores

Swapping the values behind two pointers is pure memory traffic: load both, then
store each into the other's slot. MWCC loads both words up front (into \`r5\` and
\`r0\`) *before* storing, so neither store clobbers a value still needed:

\`\`\`asm
lwz  r5, 0(r3)    # t = *a
lwz  r0, 0(r4)    # *b
stw  r0, 0(r3)    # *a = *b
stw  r5, 0(r4)    # *b = t
blr
\`\`\`

The C temporary \`t\` never reaches the stack — it lives in \`r5\` for the brief
window between the loads and stores. Watch how the compiler reorders the two
loads ahead of the stores; the order in your C source doesn't bind it.

Notice the second loaded word lands in \`r0\`. \`r0\` is special on PowerPC: when
it appears as the *base* register of a load/store (\`0(r0)\`, say) the hardware
reads it as a literal \`0\` rather than the register's contents, so the compiler
keeps it for scratch values like this and never uses it as an address base.

## Your task

Write \`swap\`, taking two \`int*\` and exchanging the values they point to.
`,
    symbol: "swap",
    starter: `void swap(int* a, int* b) {
}
`,
    solution: `void swap(int* a, int* b) {
    int t = *a;
    *a = *b;
    *b = t;
}
`,
    hints: [
      "Load both values, then store each into the other slot.",
      "Two `lwz` followed by two `stw`; the temporary stays in a register.",
    ],
  },
];
