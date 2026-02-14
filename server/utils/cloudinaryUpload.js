// utils/cloudinaryUpload.js

import cloudinary from "../configs/cloudinary.js";

export const uploadToCloudinary = (file, folder = "projects") => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto", // image / pdf / doc sab
          folder,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      )
      .end(file.buffer);
  });
};
