export default class FormatterService {
    public static fileSizeAsString(size: number): string {
        const sizeKB: number = size / 1024;
        let str = '';

        if (sizeKB > 1024) {
            str = (sizeKB / 1024).toFixed(0) + ' MB';
        } else {
            str = sizeKB.toFixed(0) + ' KB';
        }
        return str;
    }
}
