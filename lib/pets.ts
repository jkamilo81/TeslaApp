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

/**
 * Human-readable age in Spanish from a YYYY-MM-DD birth date.
 * "5 años", "1 año y 3 meses", "8 meses". Null if no birth date.
 */
export function petAge(birthDate: string | null): string | null {
  if (!birthDate) return null
  const birth = new Date(birthDate + 'T00:00:00')
  if (isNaN(birth.getTime())) return null
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  if (now.getDate() < birth.getDate()) months--
  if (months < 0) {
    years--
    months += 12
  }
  if (years < 0) return null
  const yearsLabel = years === 1 ? '1 año' : `${years} años`
  const monthsLabel = months === 1 ? '1 mes' : `${months} meses`
  if (years === 0) return monthsLabel
  if (months === 0) return yearsLabel
  if (years >= 3) return yearsLabel // past 3 years, months are noise
  return `${yearsLabel} y ${monthsLabel}`
}
