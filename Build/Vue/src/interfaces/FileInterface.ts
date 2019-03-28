export interface FileInterface {
  type: string;
  name: string;
  mtime: number;
  mtimeDisplay: string;
  size: number;
  sizeDisplay: string;
  permissions: Array<string>;
  identifier: string;
  iconIdentifier: string;
  editMetaUrl: string;
  editContentUrl: string;
}
