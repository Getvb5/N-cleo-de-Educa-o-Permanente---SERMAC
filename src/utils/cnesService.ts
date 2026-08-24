import { CnesProfessional, HealthUnit, ProfessionalCategory } from '../types';

export function formatCpf(cpfRaw: string): string {
  const digits = cpfRaw.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function validateCpf(cpfRaw: string): boolean {
  const clean = cpfRaw.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

export function validateCns(cnsRaw: string): boolean {
  const clean = cnsRaw.replace(/\D/g, '');
  if (clean.length !== 15) return false;
  const firstDigit = clean[0];
  if (!['1', '2', '7', '8', '9'].includes(firstDigit)) return false;

  if (['7', '8', '9'].includes(firstDigit)) {
    let sum = 0;
    for (let i = 0; i < 14; i++) {
      sum += parseInt(clean[i], 10) * (15 - i);
    }
    const remainder = sum % 11;
    let dv = 11 - remainder;
    if (dv === 11 || dv === 10) dv = 0;
    return parseInt(clean[14], 10) === dv;
  } else {
    const base11 = clean.substring(0, 11);
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      sum += parseInt(base11[i], 10) * (15 - i);
    }
    const remainder = sum % 11;
    let dv = 11 - remainder;
    let expected = '';
    if (dv === 11) {
      expected = base11 + '0000';
    } else if (dv === 10) {
      sum += 2;
      const rem2 = sum % 11;
      const dv2 = 11 - rem2;
      expected = base11 + '001' + String(dv2);
    } else {
      expected = base11 + '000' + String(dv);
    }
    return clean === expected;
  }
}

export async function lookupCnesProfessionalApi(
  identifier: string,
  options?: {
    unitId?: string;
    unitName?: string;
    cnesCode?: string;
    nameHint?: string;
    categoryHint?: ProfessionalCategory;
  }
): Promise<CnesProfessional | null> {
  if (!identifier || !identifier.trim()) return null;

  const clean = identifier.trim();
  const hasLetters = /[a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/i.test(clean);
  const resolvedNameHint = options?.nameHint || (hasLetters ? clean : undefined);

  try {
    const res = await fetch('/api/cnes/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: clean,
        unitId: options?.unitId,
        unitName: options?.unitName,
        cnesCode: options?.cnesCode,
        nameHint: resolvedNameHint,
        categoryHint: options?.categoryHint
      })
    });

    if (!res.ok) {
      throw new Error(`CNES lookup status ${res.status}`);
    }

    const data = await res.json();
    if (data.success && data.professional) {
      return data.professional as CnesProfessional;
    }
    if (data.id && data.name) {
      return data as CnesProfessional;
    }
    return null;
  } catch (err) {
    console.warn('CNES live API query failed, falling back to local resolver', err);
    return null;
  }
}
