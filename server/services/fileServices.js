import https from "https";

const PREVIEW_CONTENT_TYPES = {
  pdf: "application/pdf",

  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
};

const getFileExtension = (
  originalName = "",
) => {
  return (
    originalName
      .split(".")
      .pop()
      ?.toLowerCase() || ""
  );
};

const sanitizeFileName = (
  originalName = "project-file",
) => {
  return originalName.replace(
    /[\r\n"]/g,
    "_",
  );
};

const streamFile = (
  fileUrl,
  res,
  originalName,
  disposition,
) => {
  if (!fileUrl) {
    return res.status(400).json({
      success: false,
      message: "File URL not found",
    });
  }

  const safeFileName =
    sanitizeFileName(originalName);

  const encodedFileName =
    encodeURIComponent(
      originalName || "project-file",
    );

  const request = https.get(
    fileUrl,

    (fileStream) => {
      if (
        fileStream.statusCode !== 200
      ) {
        fileStream.resume();

        return res.status(502).json({
          success: false,
          message:
            "Unable to retrieve file from storage",
        });
      }

      const extension =
        getFileExtension(
          originalName,
        );

      const upstreamContentType =
        fileStream.headers[
        "content-type"
        ];

      const contentType =
        disposition === "inline"
          ? PREVIEW_CONTENT_TYPES[
          extension
          ] ||
          "application/octet-stream"
          : upstreamContentType ||
          "application/octet-stream";

      res.setHeader(
        "Content-Disposition",

        `${disposition}; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`,
      );

      res.setHeader(
        "Content-Type",
        contentType,
      );

      res.setHeader(
        "X-Content-Type-Options",
        "nosniff",
      );

      res.setHeader(
        "Cache-Control",
        "private, no-store",
      );

      const contentLength =
        fileStream.headers[
        "content-length"
        ];

      if (contentLength) {
        res.setHeader(
          "Content-Length",
          contentLength,
        );
      }

      fileStream.on(
        "error",
        () => {
          if (!res.headersSent) {
            return res
              .status(502)
              .json({
                success: false,
                message:
                  "Error while streaming file",
              });
          }

          res.destroy();
        },
      );

      fileStream.pipe(res);
    },
  );

  request.on("error", () => {
    if (!res.headersSent) {
      return res.status(502).json({
        success: false,
        message:
          "File storage request failed",
      });
    }

    res.destroy();
  });

  return request;
};

export const streamDownload = (
  fileUrl,
  res,
  originalName,
) => {
  return streamFile(
    fileUrl,
    res,
    originalName,
    "attachment",
  );
};

export const streamPreview = (
  fileUrl,
  res,
  originalName,
) => {
  return streamFile(
    fileUrl,
    res,
    originalName,
    "inline",
  );
};