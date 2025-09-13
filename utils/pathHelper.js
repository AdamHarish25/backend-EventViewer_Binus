export const generateEventAssetPaths = (eventId) => {
    const assetCategory = "desain-publikasi";
    const mainEventFolderPath = `events/${eventId}`;

    return {
        fullFolderPath: `${mainEventFolderPath}/${assetCategory}`,
        fileName: `${Date.now()}`,
    };
};
