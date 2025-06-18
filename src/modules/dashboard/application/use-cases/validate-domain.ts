/**
 * Valida se um domínio tem formato válido
 * @param domain - Domínio a ser validado
 * @returns true se válido, false caso contrário
 */
export function validateDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/
  return domainRegex.test(domain)
}
