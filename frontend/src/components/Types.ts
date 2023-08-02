export interface User {
    id: number;
    name: string;
    roles: string[];
    province: string;
    wca_person: string;
    dob: string;
}

export interface Province {
    id: string;
    label: string;
    region: string;
}

export interface ProfileEditData {
    province: string;
}