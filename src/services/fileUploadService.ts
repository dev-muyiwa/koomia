import {v2 as cloudinary, UploadApiResponse, UploadApiOptions} from "cloudinary";
import process from "process";
import {sendError} from "../utils/responseResult";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    secure: true
});

const uploadImages = async (images: string[]): Promise<object[]> => {
    try {
        const options: UploadApiOptions = {overwrite: true};

        // if (publicId) {
        //     options["public_id"] = publicId;
        // }

        const uploadPromises = images.map(async (image) => {
            // if (publicId) {
            //     options["public_id"] = publicId;
            // }
            const result: UploadApiResponse = await cloudinary.uploader.upload(image, options);
            return {
                public_id: result.public_id,
                secure_url: result.secure_url
            }
        })
        return await Promise.all(uploadPromises);
    } catch (error) {
        throw error;
    }
}

const deleteImage = async (publicId: string): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId);
        console.log('Image deleted successfully');
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
}

export {uploadImages, deleteImage};





