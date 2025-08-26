import { BaseEntity } from "./common";

export interface Contact extends BaseEntity {
    label: string;
    value: string;
    icon?: string;
    priority?: string;
}

export interface ContactsDataset {
    contacts: Contact[];
}