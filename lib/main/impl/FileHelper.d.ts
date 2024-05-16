export declare class FileHelper {
    private constructor();
    static openWithDefaulApp(path: string): void;
    static getLogFolder(): string;
    static getLogFile(): string;
    static getResourcesFolder(): string | null;
    static exists(path: string): boolean;
    static mkdir(path: string, recursive?: boolean): void;
    static append(path: string, data: string): void;
    static asarPathToAbsolute(filePath: string): string;
}
