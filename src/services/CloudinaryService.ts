import {v2 as cloudinary, UploadApiResponse, UploadApiOptions} from "cloudinary";
import process from "process";
import multer from "multer";
import {CustomError} from "../utils/CustomError";

export const uploads = multer({
    storage: multer.diskStorage({}),
    limits: {fileSize: 30_000_000} //  Allows a max size of 30mb.
})


const uploadMedia = async (mediaPath: string, options?: UploadApiOptions): Promise<UploadApiResponse> => {
    try {
        if (!mediaPath) {
            throw new CustomError("Media path cannot be empty.", CustomError.BAD_REQUEST);
        }

        const mediaOptions: UploadApiOptions = options ?? {
            use_filename: true,
            resource_type: "image"
        };

        return await cloudinary.uploader.upload(mediaPath, mediaOptions);
    } catch (err) {
        throw err;
    }
}

const deleteMedia = async (publicId: string): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        throw err;
    }
}

export default {
    uploadMedia, deleteMedia
};





