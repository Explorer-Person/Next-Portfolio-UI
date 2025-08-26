import { BaseEntity, URLString } from "./common";

export type QualificationType = "cert" | "edu";

export interface Qualification extends BaseEntity {
    type: QualificationType;
    title: string;
    org?: string;
    year?: string;
    url?: URLString;
    logo?: URLString;
    priority?: number;
}

export interface QualificationsDataset {
    qualifications: Qualification[];
}
