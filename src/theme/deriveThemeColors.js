// Runtime theme token derivation
// Keep `COLOR_SCHEMES` as pure data (palette-only), and derive Chakra-compatible
// color scales (brand/accent) from the palette at runtime.

const clampByte = (value) => Math.max(0, Math.min(255, value));

const normalizeHex = (hex) => {
  if (typeof hex !== "string") return null;
  const cleaned = hex.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(cleaned)) return cleaned.toUpperCase();
  return null;
};

export const hexToRgba = (hex, alpha) => {
  const normalized = normalizeHex(hex);
  if (!normalized) return hex;

  const safeAlpha = Number.isFinite(alpha)
    ? Math.max(0, Math.min(1, alpha))
    : 1;

  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
};

const hexToRgb = (hex) => {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
};

// Relative luminance (sRGB) for readable text color selection.
const relativeLuminance = ({ r, g, b }) => {
  const toLinear = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

export const getReadableTextColor = (
  bgHex,
  darkText = "#1A202C",
  lightText = "#FFFFFF"
) => {
  const rgb = hexToRgb(bgHex);
  if (!rgb) return darkText;
  // Simple threshold works well for UI chips.
  return relativeLuminance(rgb) > 0.55 ? darkText : lightText;
};

const hashStringToInt = (value) => {
  // Deterministic 32-bit hash (FNV-1a)
  const str = String(value ?? "");
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const getDeterministicPaletteIndex = (
  key,
  { minIndex = 1, maxIndex = 7, exclude = [] } = {}
) => {
  const safeMin = Math.max(1, Math.min(7, minIndex));
  const safeMax = Math.max(1, Math.min(7, maxIndex));
  const start = Math.min(safeMin, safeMax);
  const end = Math.max(safeMin, safeMax);

  const candidates = [];
  for (let i = start; i <= end; i++) {
    if (!exclude.includes(i)) candidates.push(i);
  }
  if (candidates.length === 0) return start;

  const hash = hashStringToInt(key);
  return candidates[hash % candidates.length];
};

// Returns a Chakra token like "palette.4".
export const getDeterministicPaletteToken = (key, options) => {
  const idx = getDeterministicPaletteIndex(key, options);
  return `palette.${idx}`;
};

const adjustBrightness = (hex, percent) => {
  const normalized = normalizeHex(hex);
  if (!normalized) return hex;

  let r = parseInt(normalized.substring(1, 3), 16);
  let g = parseInt(normalized.substring(3, 5), 16);
  let b = parseInt(normalized.substring(5, 7), 16);

  if (percent > 0) {
    r = Math.round(r + (255 - r) * percent);
    g = Math.round(g + (255 - g) * percent);
    b = Math.round(b + (255 - b) * percent);
  } else {
    r = Math.round(r * (1 + percent));
    g = Math.round(g * (1 + percent));
    b = Math.round(b * (1 + percent));
  }

  r = clampByte(r);
  g = clampByte(g);
  b = clampByte(b);

  const toHex = (c) => c.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const SCALE_STOPS = [
  [50, 0.92],
  [100, 0.84],
  [200, 0.72],
  [300, 0.56],
  [400, 0.32],
  [500, 0],
  [600, -0.12],
  [700, -0.24],
  [800, -0.36],
  [900, -0.48],
];

const scaleCache = new Map();

export const generateColorScale = (seedHex) => {
  const normalized = normalizeHex(seedHex);
  const cacheKey = normalized ?? seedHex;
  const cached = scaleCache.get(cacheKey);
  if (cached) return cached;

  const scale = SCALE_STOPS.reduce((acc, [token, delta]) => {
    acc[token] =
      delta === 0
        ? normalized ?? seedHex
        : adjustBrightness(normalized ?? seedHex, delta);
    return acc;
  }, {});

  scaleCache.set(cacheKey, scale);
  return scale;
};

export const deriveThemeColorsFromScheme = (scheme) => {
  const palette = Array.isArray(scheme?.palette) ? scheme.palette : [];
  const roles = scheme?.roles ?? {};

  const pickSeed = (role, fallback, fallbackHex) => {
    const idx = roles?.[role];
    if (
      Number.isInteger(idx) &&
      idx >= 0 &&
      idx < palette.length &&
      palette[idx]
    )
      return palette[idx];
    for (const i of fallback) {
      if (palette[i]) return palette[i];
    }
    return fallbackHex;
  };

  // Expose the 7-color palette as stable, Chakra-friendly tokens.
  // Using an object (instead of array) avoids edge cases with theme deep-merge.
  const paletteTokens = {
    1: palette[0],
    2: palette[1],
    3: palette[2],
    4: palette[3],
    5: palette[4],
    6: palette[5],
    7: palette[6],
  };

  // brand: primary identity color
  const brandSeed = pickSeed("brand", [0], "#5A67D8");

  // accent: secondary highlight (good for "review" / secondary action)
  const accentSeed = pickSeed("accent", [3, 6], "#FF6B6B");

  // semantic roles (used for difficulty/status tags etc.)
  const successSeed = pickSeed("success", [1, 0], "#22C55E");
  const warningSeed = pickSeed("warning", [2, 3], "#F59E0B");
  const dangerSeed = pickSeed("danger", [6, 5], "#EF4444");
  const neutralSeed = pickSeed("neutral", [4], "#64748B");

  return {
    // Keep both: a token object for Chakra usage, and the raw palette array for any custom logic.
    palette: paletteTokens,
    paletteRaw: palette,
    brand: generateColorScale(brandSeed),
    accent: generateColorScale(accentSeed),
    success: generateColorScale(successSeed),
    warning: generateColorScale(warningSeed),
    danger: generateColorScale(dangerSeed),
    neutral: generateColorScale(neutralSeed),
  };
};
