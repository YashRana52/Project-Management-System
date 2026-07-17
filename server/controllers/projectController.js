import path from "path";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";

import * as projectServices from "../services/projectServices.js";
import * as fileServices from "../services/fileServices.js";

const PREVIEWABLE_EXTENSIONS =
  new Set([
    ".pdf",

    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
  ]);


const getAuthorizedProjectFile = async ({
  projectId,
  fileId,
  currentUser,
}) => {
  const project =
    await projectServices
      .getProjectById(
        projectId,
      );

  const currentUserId =
    currentUser._id.toString();

  const isAdmin =
    currentUser.role === "Admin";

  const isProjectStudent =
    project.student?._id
      ?.toString() ===
    currentUserId;

  const isAssignedSupervisor =
    project.supervisor?._id
      ?.toString() ===
    currentUserId;

  const hasAccess =
    isAdmin ||
    isProjectStudent ||
    isAssignedSupervisor;

  if (!hasAccess) {
    throw new ErrorHandler(
      "You are not authorized to access files from this project",
      403,
    );
  }

  const file =
    project.files.id(fileId);

  if (!file) {
    throw new ErrorHandler(
      "File not found",
      404,
    );
  }

  return file;
};

export const downloadFile = asyncHandler(
  async (req, res) => {
    const {
      projectId,
      fileId,
    } = req.params;

    const file =
      await getAuthorizedProjectFile({
        projectId,
        fileId,
        currentUser: req.user,
      });

    return fileServices
      .streamDownload(
        file.fileUrl,
        res,
        file.originalName,
      );
  },
);


// preview
export const previewFile = asyncHandler(async (req, res) => {
  const {
    projectId,
    fileId,
  } = req.params;

  const file =
    await getAuthorizedProjectFile({
      projectId,
      fileId,
      currentUser: req.user,
    });

  const extension =
    path
      .extname(
        file.originalName,
      )
      .toLowerCase();

  if (
    !PREVIEWABLE_EXTENSIONS.has(
      extension,
    )
  ) {
    throw new ErrorHandler(
      "Preview is available only for PDF and image files",
      415,
    );
  }

  return fileServices
    .streamPreview(
      file.fileUrl,
      res,
      file.originalName,
    );
},
);