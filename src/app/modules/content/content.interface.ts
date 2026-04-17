import { AccessType, MediaType } from "../../../generated/prisma/enums";

export interface ICreateContentPayload {
    title: string;
    description?: string;
    posterUrl?: string;
    trailerUrl?: string;
    streamingUrl?: string;
    releaseYear: number;
    director?: string;
    cast: string[];
    genres: string[];
    mediaType?: MediaType;
    accessType?: AccessType;
    ticketPrice?: number | null;
}

export interface IUpdateContentPayload {
    title?: string;
    description?: string;
    posterUrl?: string;
    trailerUrl?: string;
    streamingUrl?: string;
    releaseYear?: number;
    director?: string;
    cast?: string[];
    genres?: string[];
    mediaType?: MediaType;
    accessType?: AccessType;
    ticketPrice?: number | null;
}

