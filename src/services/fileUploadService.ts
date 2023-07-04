import {v2 as cloudinary, UploadApiResponse, UploadApiOptions} from "cloudinary";
import process from "process";
import {sendError} from "../utils/responseResult";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    secure: true
});

export interface ImageResponse {
    public_id: string,
    secure_url: string,
}

const uploadImages = async (images: string[], productId: string): Promise<ImageResponse[]> => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET,
        secure: true
    });
    try {
        const options: UploadApiOptions = {
            folder: `products/${productId}`,
            use_filename: true
        };

        // const uploadPromises = images.forEach(async (image: string,index: number) => {
        //     options["filename_override"] = `product ${index}`
        //     const result: UploadApiResponse = await cloudinary.uploader.upload(image, options);
        //
        //     return {
        //         public_id: result.public_id,
        //         secure_url: result.secure_url,
        //     }
        // })

        const uploadPromises: Promise<ImageResponse>[] = images.map(async (image:string, index:number) => {
            // if (publicId) {
            //     options["public_id"] = publicId;
            // }
            options["filename_override"] = `product ${index}`
            const result: UploadApiResponse = await cloudinary.uploader.upload(image, options);
            return {
                public_id: result.public_id,
                secure_url: result.secure_url,
            } as ImageResponse
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





