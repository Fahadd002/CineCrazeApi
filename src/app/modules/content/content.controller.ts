import { Request, Response } from "express";
import status from "http-status";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ContentService } from "./content.service";
import { createContentZodSchema, updateContentZodSchema } from "./content.validation";
import { IQueryParams } from "../../interfaces/query.interface";

const parseStringArray = (value: unknown): string[] | undefined => {
    if (Array.isArray(value)) return value as string[];
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
        const parsed = JSON.parse(trimmed) as unknown;
        return Array.isArray(parsed) ? (parsed as string[]) : [trimmed];
    } catch {
        return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
    }
};

const normalizeContentPayload = (req: Request) => {
  const body: Record<string, unknown> = req.body.data
    ? JSON.parse(req.body.data)
    : req.body;

  const normalizedPayload: Record<string, unknown> = { ...body };

  if (typeof body.releaseYear === "string") {
    normalizedPayload.releaseYear = Number(body.releaseYear);
  }

  if (typeof body.ticketPrice === "string") {
    normalizedPayload.ticketPrice =
      body.ticketPrice === "" ? null : Number(body.ticketPrice);
  }

  if (body.cast !== undefined) {
    normalizedPayload.cast = parseStringArray(body.cast);
  }

  if (body.genres !== undefined) {
    normalizedPayload.genres = parseStringArray(body.genres);
  }

  return normalizedPayload;
};

const uploadContentMediaFiles = async (req: Request) => {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const mediaUrls: { posterUrl?: string; trailerUrl?: string; streamingUrl?: string } = {};

    const posterImage = files?.posterImage?.[0];
    if (posterImage?.buffer) {
        const uploaded = await uploadFileToCloudinary(posterImage.buffer, posterImage.originalname);
        mediaUrls.posterUrl = uploaded.secure_url;
    }

    const trailerVideo = files?.trailerVideo?.[0];
    if (trailerVideo?.buffer) {
        const uploaded = await uploadFileToCloudinary(trailerVideo.buffer, trailerVideo.originalname);
        mediaUrls.trailerUrl = uploaded.secure_url;
    }

    const streamingVideo = files?.streamingVideo?.[0];
    if (streamingVideo?.buffer) {
        const uploaded = await uploadFileToCloudinary(streamingVideo.buffer, streamingVideo.originalname);
        mediaUrls.streamingUrl = uploaded.secure_url;
    }

    return mediaUrls;
};

const createContent = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user!;
        const payload = createContentZodSchema.parse(normalizeContentPayload(req));
        const mediaUrls = await uploadContentMediaFiles(req);

        const content = await ContentService.createContent({ ...payload, ...mediaUrls }, user);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Content created successfully",
            data: content,
        });
    }
);

const getAllContents = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result  = await ContentService.getAllContents(query as IQueryParams);
    sendResponse(res, {
        success: true,
        httpStatusCode: status.OK,
        message: 'All doctor schedules retrieved successfully',
        data: result.data,
        meta: result.meta
    });
});

const getContentById = catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;

        const content = await ContentService.getContentById(id);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Content fetched successfully",
            data: content,
        });
    }
);

const updateContent = catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const user = req.user!;
        const payload = updateContentZodSchema.parse(normalizeContentPayload(req));
        const mediaUrls = await uploadContentMediaFiles(req);

        const content = await ContentService.updateContent(id, { ...payload, ...mediaUrls }, user);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Content updated successfully",
            data: content,
        });
    }
);

const deleteContent = catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const user = req.user!;

        await ContentService.deleteContent(id as string, user);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Content deleted successfully",
            data: null,
        });
    }
);

const getWatchableContent = catchAsync(
    async (req: Request, res: Response) => {
        const id = req.params.id as string;
        const user = req.user!;

        const content = await ContentService.canViewerWatchContent(id as string, user);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Content is accessible",
            data: content,
        });
    }
);

export const ContentController = {
    createContent,
    getAllContents,
    getContentById,
    updateContent,
    deleteContent,
    getWatchableContent,
};

