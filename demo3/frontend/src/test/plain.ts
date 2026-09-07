// fr-FR formatting uses narrow no-break spaces (U+202F) and no-break spaces (U+00A0)
// as group separators. Tests normalise them to plain spaces for readable assertions.
const SPECIAL_SPACES = new RegExp(`[${String.fromCharCode(0x202f)}${String.fromCharCode(0xa0)}]`, 'g')

export const plain = (s: string | null | undefined): string => (s ?? '').replace(SPECIAL_SPACES, ' ')
