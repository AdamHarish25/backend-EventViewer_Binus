export const generateEventAssetPaths = (eventId) => {
    const assetCategory = "desain-publikasi";
    const mainEventFolderPath = `events/${eventId}`;

    return {
        mainEventFolderPath,
        fullFolderPath: `${mainEventFolderPath}/${assetCategory}`,
        fileName: `${Date.now()}`,
    };
};
