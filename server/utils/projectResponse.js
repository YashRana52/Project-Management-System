const toPlainObject = (value) => {
    if (!value) {
        return value;
    }

    return typeof value.toObject === "function"
        ? value.toObject()
        : value;
};

const buildSafeFileResponse = (file) => {
    const fileObject =
        toPlainObject(file);

    return {
        _id: fileObject._id,

        originalName:
            fileObject.originalName,

        fileType:
            fileObject.fileType,

        uploadedAt:
            fileObject.uploadedAt,
    };
};

const buildSafeFeedbackResponse = (
    feedback,
) => {
    const feedbackObject =
        toPlainObject(feedback);

    return {
        _id: feedbackObject._id,

        supervisorId:
            feedbackObject.supervisorId,

        type:
            feedbackObject.type,

        title:
            feedbackObject.title,

        message:
            feedbackObject.message,

        createdAt:
            feedbackObject.createdAt,

        updatedAt:
            feedbackObject.updatedAt,
    };
};

export const buildSafeProjectResponse = (
    project,
) => {
    if (!project) {
        return null;
    }

    const projectObject =
        toPlainObject(project);

    return {
        _id: projectObject._id,

        student:
            projectObject.student || null,

        supervisor:
            projectObject.supervisor || null,

        title:
            projectObject.title,

        description:
            projectObject.description,

        status:
            projectObject.status,

        deadline:
            projectObject.deadline || null,

        files: (
            projectObject.files || []
        ).map(buildSafeFileResponse),

        feedback: (
            projectObject.feedback || []
        ).map(
            buildSafeFeedbackResponse,
        ),

        createdAt:
            projectObject.createdAt,

        updatedAt:
            projectObject.updatedAt,
    };
};

export const buildSafeProjectList = (
    projects = [],
) => {
    return projects.map(
        buildSafeProjectResponse,
    );
};