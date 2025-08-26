import { BaseEntity } from "./common";

export interface SignupForm extends BaseEntity {
    username: string;
    email: string;
    password: string;
    confirmPassword?: string;
    acceptTerms: boolean;
};