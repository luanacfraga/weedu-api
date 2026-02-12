export class PlatformSettings {
  constructor(
    public readonly id: string,
    public readonly supportWhatsapp: string | null,
    public readonly supportEmail: string | null,
  ) {}
}
