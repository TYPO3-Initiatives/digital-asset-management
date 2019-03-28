export interface ImageInterface {
  type: string;
  name: string;
  mtime: number;
  mtimeDisplay: string;
  size: number;
  sizeDisplay: string;
  permissions: Array<string>;
  identifier: string;
  editMetaUrl: string;
  editContentUrl: string;
  thumbnailUrl: string;
}
