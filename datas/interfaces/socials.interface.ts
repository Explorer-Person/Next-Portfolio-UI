import { BaseEntity, URLString } from "./common";



export interface Social extends BaseEntity {
    platform: string;
    icon: string;
    url: string;
    size?: number | null;
    priority?: number;
}

export interface SocialsDataset {
    socials: Social[];
}
