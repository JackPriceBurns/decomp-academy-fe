// Curated playground examples: real functions mined from open GameCube decomp
// projects (Star Fox Adventures, Pikmin 2, Mario Party 4, The Wind Waker, Melee,
// Metroid Prime, Mario Kart: Double Dash, and the Dolphin SDK), each adapted to
// self-contained C89 and compile-verified against the actual MWCC GC/2.0 toolchain
// with the same flags the playground uses. Picked to show off compiler idioms a
// decomp learner should recognise (fsel, frsqrte, paired singles, relocations,
// bit tricks, fma chains). Generated — see scripts/the examples workflow.

export type ExampleCategory =
  "Math" | "Vector" | "Matrix" | "Sorting" | "Bits" | "Random" | "Memory" | "Game";

export interface PlaygroundExample {
  id: string;
  label: string;
  game: string;
  category: ExampleCategory;
  symbol: string;
  blurb: string;
  code: string;
}

export const EXAMPLES: PlaygroundExample[] = [
  {
    id: "vec3-cross",
    label: "3D cross product",
    game: "Star Fox Adventures",
    category: "Vector",
    symbol: "Vec3_Cross",
    blurb:
      "Classic three-component cross product whose a*b - c*d pairs each fold into a fused fmuls + fmsubs, a clean demo of multiply-then-subtract becoming single instructions.",
    code: "/* 3D cross product. Adapted from Star Fox Adventures vecmath.c (Vec3_Cross). */\nvoid Vec3_Cross(f32 *a, f32 *b, f32 *out)\n{\n    out[0] = a[1] * b[2] - a[2] * b[1];\n    out[1] = a[2] * b[0] - a[0] * b[2];\n    out[2] = a[0] * b[1] - a[1] * b[0];\n}",
  },
  {
    id: "vec3-normalize-melee",
    label: "Vec3 normalize",
    game: "Melee",
    category: "Vector",
    symbol: "lbVector_Normalize",
    blurb:
      "Normalizes a Vec3 in place and returns the original length; shows a sqrtf call relocation, an early-out fcmpu against zero, and a reciprocal computed once then reused across all three components.",
    code: "typedef struct Vec3 {\n    f32 x, y, z;\n} Vec3;\n\nextern f32 sqrtf(f32 x);\n\n/* Normalize a 3D vector in place; returns the original length. */\nf32 lbVector_Normalize(Vec3* vec)\n{\n    f32 len = sqrtf(vec->x * vec->x + vec->y * vec->y + vec->z * vec->z);\n    f32 inv;\n\n    if (len == 0.0f) {\n        return 0.0f;\n    }\n    inv = 1.0f / len;\n    vec->x *= inv;\n    vec->y *= inv;\n    vec->z *= inv;\n    return len;\n}\n",
  },
  {
    id: "clib-addcalc",
    label: "Smooth approach (cLib_addCalc)",
    game: "The Wind Waker",
    category: "Math",
    symbol: "cLib_addCalc",
    blurb:
      "The signature Zelda easing helper that nudges a float toward a target with a scaled step plus a min/max-step deadzone; the compiler turns the cascade of float compares into tight fcmp/branch logic with a tail fabsf call.",
    code: "float fabsf(float);\n\nf32 cLib_addCalc(f32* pValue, f32 target, f32 scale, f32 maxStep, f32 minStep) {\n    if (*pValue != target) {\n        f32 step = scale * (target - *pValue);\n        if (step >= minStep || step <= -minStep) {\n            if (step > maxStep) {\n                step = maxStep;\n            }\n            if (step < -maxStep) {\n                step = -maxStep;\n            }\n            *pValue += step;\n        } else {\n            if (step > 0) {\n                if (step < minStep) {\n                    *pValue += minStep;\n                    if (*pValue > target) {\n                        *pValue = target;\n                    }\n                }\n            } else {\n                minStep = -minStep;\n                if (step > minStep) {\n                    *pValue += minStep;\n                    if (*pValue < target) {\n                        *pValue = target;\n                    }\n                }\n            }\n        }\n    }\n    return fabsf(target - *pValue);\n}",
  },
  {
    id: "crandom16-next",
    label: "16-bit LCG random",
    game: "Metroid Prime",
    category: "Random",
    symbol: "CRandom16_Next",
    blurb:
      "The classic linear-congruential RNG (seed*0x41c64e6d+0x3039, return bits 16-31); a tidy mullw/addi update with srwi+clrlwi extraction, and Range/Float show the follow-on divw and integer-to-float conversion.",
    code: "typedef struct CRandom16 {\n    u32 seed;\n} CRandom16;\n\n/* Classic 16-bit linear-congruential generator (Metroid Prime RNG). */\ns32 CRandom16_Next(CRandom16* r)\n{\n    r->seed = (r->seed * 0x41c64e6d) + 0x00003039;\n    return (r->seed >> 16) & 0xffff;\n}\n\n/* Uniform integer in [min, max]. */\ns32 CRandom16_Range(CRandom16* r, s32 min, s32 max)\n{\n    return min + (CRandom16_Next(r) % ((max - min) + 1));\n}\n\n/* Uniform float in [0, 1). */\nf32 CRandom16_Float(CRandom16* r)\n{\n    return 1.52590222e-5f * (f32)CRandom16_Next(r);\n}\n",
  },
  {
    id: "cntlzd",
    label: "Count leading zeros (64-bit)",
    game: "Dolphin SDK",
    category: "Bits",
    symbol: "cntlzd",
    blurb:
      "Counts leading zero bits of a 64-bit value by splitting into two words and using the __cntlzw builtin, which compiles straight to the PowerPC cntlzw instruction plus a conditional tail-return.",
    code: "/* Count leading zeros of a 64-bit value using the PowerPC cntlzw intrinsic.\n   Adapted from Dolphin SDK VI (cntlzd in vi.c). __cntlzw is a compiler builtin. */\ns32 cntlzd(u64 bit)\n{\n    u32 hi;\n    u32 lo;\n    s32 value;\n\n    hi    = bit >> 32;\n    lo    = bit & 0xFFFFFFFF;\n    value = __cntlzw(hi);\n    if (value < 32) {\n        return value;\n    }\n    return __cntlzw(lo) + 32;\n}",
  },
  {
    id: "checkflag-bitset",
    label: "Event-flag bitset",
    game: "Mario Party 4",
    category: "Bits",
    symbol: "_CheckFlag",
    blurb:
      "A 128-bit event-flag store: get/set/clear a single bit out of a packed byte array, a clean lesson in how index/8 and index%8 become rlwinm/slw with lbzx/stbx, an and/or/nand mask, plus SDA21 and ADDR16_HA/LO relocations.",
    code: "/* Mario Party 4 - flag.c : 128-bit event-flag bitset. flag low 16 bits index a\n   bit; bits 16+ select a 16-flag group. byte = index/8, mask = 1 << (index%8). */\ntypedef struct { u8 flag[3][2]; } GameWork; /* 3 groups x 16 bits */\nextern GameWork GWSystem;\nstatic u8 _Sys_Flag[16];\n\nstatic u8 *GetFlagPtr(u32 flag)\n{\n    u8 *ret;\n    u32 group = flag >> 16;\n    if ((flag & 0xFFFF0000) == 0x30000) {\n        ret = _Sys_Flag;\n    } else {\n        ret = &GWSystem.flag[group][0];\n    }\n    return ret;\n}\n\ns32 _CheckFlag(u32 flag)\n{\n    u8 *flag_ptr = GetFlagPtr(flag);\n    u16 index = flag;\n    return flag_ptr[index/8] & (1 << (index % 8));\n}\n\nvoid _SetFlag(u32 flag)\n{\n    u8 *flag_ptr = GetFlagPtr(flag);\n    u16 index = flag;\n    flag_ptr[index/8] |= (1 << (index % 8));\n}\n\nvoid _ClearFlag(u32 flag)\n{\n    u8 *flag_ptr = GetFlagPtr(flag);\n    u16 index = flag;\n    flag_ptr[index/8] &= ~(1 << (index % 8));\n}",
  },
  {
    id: "trandom-nextfloat",
    label: "Fast LCG random float",
    game: "Pikmin 2",
    category: "Random",
    symbol: "TRandom_nextFloat_0_1",
    blurb:
      "An LCG step plus a branchless [0,1) float draw: instead of an int-to-float convert, a slick bit hack ORs random mantissa bits into 1.0 (oris 0x3F80) then subtracts via a stw/lfs reinterpret.",
    code: "typedef struct TRandom_fast {\n\tu32 value;\n} TRandom_fast;\n\n/* Linear congruential generator step (constants from Twilight Princess). */\nu32 TRandom_next(TRandom_fast* r)\n{\n\treturn r->value = r->value * 0x19660d + 0x3c6ef35f;\n}\n\n/* Uniform float in [0,1): stuff 23 random mantissa bits into 1.0..2.0 then\n   subtract 1.0 -- no integer-to-float conversion needed. */\nf32 TRandom_nextFloat_0_1(TRandom_fast* r)\n{\n\tu32 nextValue = (TRandom_next(r) >> 9) | 0x3F800000;\n\treturn *(f32*)(void*)&nextValue - 1.0f;\n}",
  },
  {
    id: "jgeometry-sqrt",
    label: "frsqrte square root",
    game: "Mario Kart: Double Dash",
    category: "Math",
    symbol: "JGeometry_sqrt",
    blurb:
      "Computes sqrt and 1/sqrt using the hardware frsqrte estimate refined by a single Newton-Raphson step; the canonical frsqrte + frsp + fnmsubs sequence every GC/Wii decomper learns to recognize.",
    code: "/* Square root: hardware reciprocal-sqrt estimate refined by one\n   Newton-Raphson iteration, then multiplied back by x. */\nf32 JGeometry_sqrt(f32 x)\n{\n    f32 y;\n    if (x <= 0.0f) {\n        return x;\n    }\n    y = __frsqrte(x);\n    y = 0.5f * y * (3.0f - (x * (y * y)));\n    return x * y;\n}\n\n/* Reciprocal square root using the same refinement. */\nf32 JGeometry_inv_sqrt(f32 x)\n{\n    f32 y;\n    if (x <= 0.0f) {\n        return x;\n    }\n    y = __frsqrte(x);\n    y = 0.5f * y * (3.0f - (x * (y * y)));\n    return y;\n}\n",
  },
  {
    id: "fast-sin-r",
    label: "Quintic sine approximation",
    game: "Metroid Prime",
    category: "Math",
    symbol: "FastSinR",
    blurb:
      "Polynomial sine with coefficients stored as raw u32 bit patterns reinterpreted as floats; range reduction via an int(x*1/2pi) round-trip plus an fmadds Horner chain, with bit-cast loads from .sdata2.",
    code: "#define M_PIF  3.14159265358979323846f\n#define M_2PIF 6.28318530718f\n\n/* Reduce an angle in radians to the range (-pi, pi]. */\nstatic f32 WrapPi(f32 rad)\n{\n    int v = (int)(rad * (1.0f / M_2PIF));\n    f32 value = rad - v * M_2PIF;\n    if (value > M_PIF) {\n        return value - M_2PIF;\n    } else if (value < -M_PIF) {\n        return value + M_2PIF;\n    }\n    return value;\n}\n\n/* Quintic polynomial sine approximation with bit-pattern coefficients. */\nf32 FastSinR(f32 x)\n{\n    static const u32 skSinX1 = 0x3f7ff347;\n    static const u32 skSinX2 = 0xbe2a34ae;\n    static const u32 skSinX3 = 0x3c047fca;\n    static const u32 skSinX4 = 0xb9206873;\n    f32 x2;\n    f32 acc;\n\n    if ((x < 0.0f ? -x : x) > M_PIF) {\n        x = WrapPi(x);\n    }\n\n    x2 = x * x;\n    acc = x;\n    acc *= *(const f32*)&skSinX1;\n    x *= x2;\n    acc += x * *(const f32*)&skSinX2;\n    x *= x2;\n    acc += x * *(const f32*)&skSinX3;\n    x *= x2;\n    acc += x * *(const f32*)&skSinX4;\n    return acc;\n}\n",
  },
  {
    id: "floor-power-of-two",
    label: "Floor power of two",
    game: "Metroid Prime",
    category: "Bits",
    symbol: "FloorPowerOfTwo",
    blurb:
      "Branchlessly rounds an int down to the nearest power of two; a textbook cascade of rlwinm/subfic/srw that does a binary search for the top set bit with no loops or branches.",
    code: "/* Branchless: round an int down to the nearest power of two. */\ns32 FloorPowerOfTwo(s32 v)\n{\n    u32 s1, sb1, s2, sb2, s3, sb3, s4, totalShift, finalSig, finalShift;\n\n    if (v == 0) {\n        return 0;\n    }\n    s1 = (0xffffU - v) >> 0x1b & 0x10;\n    sb1 = (u32)v >> s1 & 0xffff;\n    s2 = (0xff - sb1) >> 0x1c & 8;\n    sb2 = sb1 >> s2 & 0xff;\n    s3 = ((0xf - sb2) >> 0x1d) & 4;\n    sb3 = (sb2 >> s3) & 0xf;\n    s4 = (3 - sb3) >> 0x1e & 2;\n    totalShift = s1 + s2 + s3 + s4;\n    finalSig = sb3 >> s4 & 3;\n    finalShift = ((1 - finalSig) >> 0x1f) + totalShift;\n    return 1 << finalShift;\n}\n",
  },
  {
    id: "board-player-rank",
    label: "Board player rank",
    game: "Mario Party 4",
    category: "Game",
    symbol: "BoardPlayerRankCalc",
    blurb:
      "Real board logic that ranks a player by packing stars above coins (stars << 10) into one score and counting opponents who beat it; the optimizer fully unrolls the 4-player compare loop into a chain of cmpw/bge with savegpr/restgpr helpers.",
    code: "/* Mario Party 4 - board/player.c : compute a player's board rank (0=1st place).\n   Score packs coins in low bits and stars shifted up so stars dominate. */\nextern s32 GWCoinsGet(s32 player);\nextern s32 GWStarsGet(s32 player);\n\ns32 BoardPlayerRankCalc(s32 player)\n{\n    s32 coins;\n    s32 rank;\n    s32 i;\n    s32 score[4];\n\n    for (i = 0; i < 4; i++) {\n        coins = GWCoinsGet(i);\n        score[i] = coins | (GWStarsGet(i) << 0xA);\n    }\n    for (rank = 0, i = 0; i < 4; i++) {\n        if ((i != player) && (score[player] < score[i])) {\n            rank++;\n        }\n    }\n    return rank;\n}",
  },
  {
    id: "search-near-kart",
    label: "Nearest kart search",
    game: "Mario Kart: Double Dash",
    category: "Game",
    symbol: "searchNearKart",
    blurb:
      "Scans an array of kart positions for the closest within a radius using squared distances (no sqrt); a clean counted loop with an fmadds-built squared length, an fcmpo against the running minimum, and conditional index update.",
    code: "typedef struct Vec3 {\n    f32 x, y, z;\n} Vec3;\n\n/* Find the index of the kart nearest to enemyPos within radius r;\n   returns -1 if none. Uses squared distances to avoid sqrt. */\ns16 searchNearKart(const Vec3* karts, s16 count, const Vec3* enemyPos, f32 r)\n{\n    f32 rad = r * r;\n    s16 ret = -1;\n    s16 i;\n\n    for (i = 0; i < count; i++) {\n        f32 dx = karts[i].x - enemyPos->x;\n        f32 dy = karts[i].y - enemyPos->y;\n        f32 dz = karts[i].z - enemyPos->z;\n        f32 len = dx * dx + dy * dy + dz * dz;\n        if (len < rad) {\n            rad = len;\n            ret = i;\n        }\n    }\n    return ret;\n}\n",
  },
  {
    id: "jmavec-scale-add",
    label: "Paired-single scale-add",
    game: "Pikmin 2",
    category: "Vector",
    symbol: "JMAVECScaleAdd",
    blurb:
      "Computes dst = vec1*scale + vec2 for a 3-float vector two lanes at a time; pure paired-single Gekko: psq_l with single-element quantize mode for z, ps_madds0 fused multiply-add, and psq_st stores.",
    code: "typedef struct Vec {\n\tf32 x, y, z;\n} Vec;\n\n/* dst = vec1 * scale + vec2, done with paired-single math (two lanes at once). */\nvoid JMAVECScaleAdd(register const Vec* vec1, register const Vec* vec2, register Vec* dst, register f32 scale)\n{\n\tregister f32 v1xy, v2xy, rxy, v1z, v2z, rz;\n\tasm {\n\t\tpsq_l     v1xy, 0(vec1), 0, 0\n\t\tpsq_l     v2xy, 0(vec2), 0, 0\n\t\tpsq_l     v1z,  8(vec1), 1, 0\n\t\tpsq_l     v2z,  8(vec2), 1, 0\n\t\tps_madds0 rxy,  v1xy, scale, v2xy\n\t\tps_madds0 rz,   v1z,  scale, v2z\n\t\tpsq_st    rxy,  0(dst), 0, 0\n\t\tpsq_st    rz,   8(dst), 1, 0\n\t}\n}",
  },
  {
    id: "mdomtx-inverse-transpose",
    label: "3x3 inverse-transpose",
    game: "The Wind Waker",
    category: "Matrix",
    symbol: "mDoMtx_inverseTranspose",
    blurb:
      "Computes the determinant of a 3x3 matrix, early-returns if singular, then fills the inverse-transpose (for normals); a dense, fma-heavy block of fmuls/fmadds/fnmsubs that is a great fp-scheduling read.",
    code: "typedef f32 Mtx[3][4];\ntypedef f32 Mtx23[2][3];\n\nBOOL mDoMtx_inverseTranspose(const Mtx a, Mtx b) {\n    f32 var1;\n    Mtx23 tmp;\n    var1 = a[0][0] * a[1][1] * a[2][2] + a[0][1] * a[1][2] * a[2][0] +\n           a[0][2] * a[1][0] * a[2][1] - a[2][0] * a[1][1] * a[0][2] -\n           a[1][0] * a[0][1] * a[2][2] - a[0][0] * a[2][1] * a[1][2];\n\n    if (var1 == 0.0f) {\n        return FALSE;\n    }\n    var1 = 1.0f / var1;\n\n    tmp[0][0] = var1 * (a[1][1] * a[2][2] - a[2][1] * a[1][2]);\n    tmp[0][1] = var1 * -(a[1][0] * a[2][2] - a[2][0] * a[1][2]);\n    tmp[0][2] = var1 * (a[1][0] * a[2][1] - a[2][0] * a[1][1]);\n    tmp[1][0] = var1 * -(a[0][1] * a[2][2] - a[2][1] * a[0][2]);\n    tmp[1][1] = var1 * (a[0][0] * a[2][2] - a[2][0] * a[0][2]);\n    tmp[1][2] = var1 * -(a[0][0] * a[2][1] - a[2][0] * a[0][1]);\n\n    b[2][0] = var1 * (a[0][1] * a[1][2] - a[1][1] * a[0][2]);\n    b[2][1] = var1 * -(a[0][0] * a[1][2] - a[1][0] * a[0][2]);\n    b[2][2] = var1 * (a[0][0] * a[1][1] - a[1][0] * a[0][1]);\n    b[0][0] = tmp[0][0];\n    b[0][1] = tmp[0][1];\n    b[0][2] = tmp[0][2];\n    b[0][3] = 0.0f;\n    b[1][0] = tmp[1][0];\n    b[1][1] = tmp[1][1];\n    b[1][2] = tmp[1][2];\n    b[1][3] = 0.0f;\n    b[2][3] = 0.0f;\n\n    return TRUE;\n}",
  },
  {
    id: "lbvector-euler-matrix",
    label: "Euler rotation matrix",
    game: "Melee",
    category: "Matrix",
    symbol: "lbVector_CreateEulerMatrix",
    blurb:
      "Builds a 3x4 rotation matrix Rz*Ry*Rx from three Euler angles; the asm interleaves the inlined quintic sin/cos approximations with the matrix-element stores, showing how the compiler schedules many fmuls/fmadds into a row-major Mtx.",
    code: "typedef f32 Mtx[3][4];\ntypedef struct Vec3 {\n    f32 x, y, z;\n} Vec3;\n\n#define M_PI  3.14159265358979323846f\n#define M_TAU 6.28318530718f\n\n/* Best quintic approximation of sine on (-pi, pi). */\nstatic f32 sinf_approx(f32 angle)\n{\n    if (angle > M_PI) {\n        angle -= M_TAU;\n    } else if (angle < -M_PI) {\n        angle += M_TAU;\n    }\n    return 0.9878619909286499f * angle -\n           0.15527099370956421f * angle * angle * angle +\n           0.0056429998949170113f * angle * angle * angle * angle * angle;\n}\n\nstatic f32 cosf_approx(f32 angle)\n{\n    angle += M_PI / 2;\n    if (angle > M_PI) {\n        angle -= M_TAU;\n    } else if (angle < -M_PI) {\n        angle += M_TAU;\n    }\n    return 0.9878619909286499f * angle -\n           0.15527099370956421f * angle * angle * angle +\n           0.0056429998949170113f * angle * angle * angle * angle * angle;\n}\n\n/* Build the 3x3 rotation matrix m = Rz(z) * Ry(y) * Rx(x); no translation. */\nvoid lbVector_CreateEulerMatrix(Mtx m, Vec3* angles)\n{\n    f32 sx = sinf_approx(angles->x);\n    f32 cx = cosf_approx(angles->x);\n    f32 sy = sinf_approx(angles->y);\n    f32 cy = cosf_approx(angles->y);\n    f32 sz = sinf_approx(angles->z);\n    f32 cz = cosf_approx(angles->z);\n\n    f32 sxsy = sx * sy;\n    f32 cxsy = cx * sy;\n\n    m[0][0] = cy * cz;\n    m[1][0] = cy * sz;\n    m[2][0] = -sy;\n\n    m[0][1] = cz * sxsy - cx * sz;\n    m[1][1] = sz * sxsy + cx * cz;\n    m[2][1] = sx * cy;\n\n    m[0][2] = cz * cxsy + sx * sz;\n    m[1][2] = sz * cxsy - sx * cz;\n    m[2][2] = cx * cy;\n\n    m[0][3] = 0.0f;\n    m[1][3] = 0.0f;\n    m[2][3] = 0.0f;\n}\n",
  },
];
