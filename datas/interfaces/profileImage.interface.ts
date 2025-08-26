import { BaseEntity, URLString } from "./common";

export interface ProfileImage extends BaseEntity {
    src: URLString;
    alt?: string;
    width?: number;
    height?: number;
    className?: string;
}

export interface ProfileImageDataset {
    profileImage: ProfileImage;
}
