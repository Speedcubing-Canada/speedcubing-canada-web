export interface User {
    id: number;
    name: string;
    roles: string[];
    province: string;
    wca_person: string;
}

export interface Province {
    id: string;
    label: string;
}

export interface ProfileEditData {
    province: string;
}