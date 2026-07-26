/**
 * URL slug for a pet name. Lowercases, strips accents and collapses
 * whitespace to hyphens, so "Kora" -> "kora" and "Luna Bella" -> "luna-bella".
 *
 * Used both to build links to a pet profile and to resolve the /[pet] route
 * back to a pet, so the two must always stay in sync.
 */
export function petSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}
