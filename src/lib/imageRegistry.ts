/**
 * A simple registry to track pending image uploads.
 * Maps temporary blob URLs to their original File objects.
 */
class ImageRegistry {
    private registry: Map<string, File> = new Map();
    private originalUrls: Map<string, string> = new Map(); // Maps blobURL to the old Cloudinary URL it replaced

    register(blobUrl: string, file: File, replacedUrl?: string) {
        this.registry.set(blobUrl, file);
        if (replacedUrl) {
            this.originalUrls.set(blobUrl, replacedUrl);
        }
    }

    getFile(blobUrl: string): File | undefined {
        return this.registry.get(blobUrl);
    }

    getReplacedUrl(blobUrl: string): string | undefined {
        return this.originalUrls.get(blobUrl);
    }

    unregister(blobUrl: string) {
        this.registry.delete(blobUrl);
        this.originalUrls.delete(blobUrl);
    }

    clear() {
        this.registry.clear();
        this.originalUrls.clear();
    }
}

export const imageRegistry = new ImageRegistry();
