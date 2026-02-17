export class PhoneValidator {
  private static readonly PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

  static isValid(phone: string): boolean {
    if (!phone) {
      return false;
    }
    return this.PHONE_REGEX.test(phone.trim());
  }

  static normalize(phone: string): string {
    const cleaned = phone.trim().replace(/\s+/g, '');

    if (!cleaned.startsWith('+')) {
      throw new Error(
        'Número de telefone deve começar com + seguido do código do país (formato E.164)',
      );
    }

    if (!this.isValid(cleaned)) {
      throw new Error(
        'Número de telefone inválido. Use o formato E.164: +[código país][número]',
      );
    }

    return cleaned;
  }
}
