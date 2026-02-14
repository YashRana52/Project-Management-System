export const formatDateReadable = (date) => {
  if (!date) return "";

  const d = new Date(date);

  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
