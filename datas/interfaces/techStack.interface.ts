import { BaseEntity, URLString } from "./common";

export interface TechStack extends BaseEntity {
    icon?: URLString;
    name: string;
    level?: string;
    priority?: number;
}

export type TechStacksDataset = TechStack[];
