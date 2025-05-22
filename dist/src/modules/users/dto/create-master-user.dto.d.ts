declare class CompanyDto {
    name: string;
    cnpj: string;
    address?: string;
    phone?: string;
    email?: string;
}
export declare class CreateMasterUserDto {
    name: string;
    email: string;
    password: string;
    company: CompanyDto;
    planId: string;
}
export {};
