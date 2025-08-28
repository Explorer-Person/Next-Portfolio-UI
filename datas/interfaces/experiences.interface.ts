import { BaseEntity } from "./common";

export interface Experience extends BaseEntity {
    company: string; // e.g., "Creative Minds"
    location?: string; // e.g., "New York, USA"
    job: string; // e.g., "Senior Product Designer"
    affairs?: string; // short description
    medias?: string[]; // image URLs
    startDate: string; // ISO or pretty, e.g., "February 2022"
    endDate?: string; // e.g., "February 2022"
    isPresent?: boolean; // if true, ignore endDate and show Present
    tags?: string[]; // ["UIUX","Branding"]
    href?: string; // external link
}

export interface ExperiencesDataset {
    contacts: Experience[];
}