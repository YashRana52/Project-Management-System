import https from "https";

export const streamDownload = (fileUrl, res, originalName) => {
  if (!fileUrl) {
    return res.status(400).json({
      success: false,
      message: "File URL not found",
    });
  }

  // Set download headers
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${originalName}"`,
  );
  res.setHeader("Content-Type", "application/octet-stream");

  https
    .get(fileUrl, (fileStream) => {
      if (fileStream.statusCode !== 200) {
        return res.status(500).json({
          success: false,
          message: "Unable to download file",
        });
      }

      fileStream.on("error", () => {
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "Error while streaming file",
          });
        }
      });

      fileStream.pipe(res);
    })
    .on("error", () => {
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Download request failed",
        });
      }
    });
};
