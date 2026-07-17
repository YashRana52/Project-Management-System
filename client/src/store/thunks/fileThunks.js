import { createAsyncThunk } from "@reduxjs/toolkit";

import { axiosInstance } from "../../lib/axios";

// Blob response ke andar aaye backend error ko read karna
export const getFileResponseErrorMessage =
    async (
        error,
        fallbackMessage,
    ) => {
        const errorData =
            error?.response?.data;

        if (errorData instanceof Blob) {
            try {
                const errorText =
                    await errorData.text();

                const parsedError =
                    JSON.parse(errorText);

                return (
                    parsedError?.message ||
                    fallbackMessage
                );
            } catch {
                return fallbackMessage;
            }
        }

        return (
            errorData?.message ||
            error?.message ||
            fallbackMessage
        );
    };

export const downloadProjectFile =
    createAsyncThunk(
        "files/downloadProjectFile",

        async (
            {
                projectId,
                fileId,
                originalName,
            },

            { rejectWithValue },
        ) => {
            try {
                if (!projectId || !fileId) {
                    return rejectWithValue(
                        "Project or file information is missing",
                    );
                }

                const response =
                    await axiosInstance.get(
                        `project/${projectId}/files/${fileId}/download`,

                        {
                            responseType: "blob",
                        },
                    );

                const fileBlob =
                    response.data instanceof Blob
                        ? response.data
                        : new Blob(
                            [response.data],
                            {
                                type:
                                    response.headers[
                                    "content-type"
                                    ] ||
                                    "application/octet-stream",
                            },
                        );

                const objectUrl =
                    window.URL.createObjectURL(
                        fileBlob,
                    );

                const downloadLink =
                    document.createElement("a");

                downloadLink.href = objectUrl;

                downloadLink.download =
                    originalName ||
                    "project-file";

                document.body.appendChild(
                    downloadLink,
                );

                downloadLink.click();

                document.body.removeChild(
                    downloadLink,
                );

                /*
                 * Browser ko download start karne ka chance dene ke
                 * baad temporary Object URL clean kar rahe hain.
                 */
                window.setTimeout(() => {
                    window.URL.revokeObjectURL(
                        objectUrl,
                    );
                }, 0);

                return {
                    projectId,
                    fileId,
                };
            } catch (error) {
                const message =
                    await getFileResponseErrorMessage(
                        error,
                        "Failed to download file",
                    );

                return rejectWithValue(message);
            }
        },
    );