export interface FolderInterface {
  type: string;
  name: string;
  mtime: number;
  mtimeDisplay: string;
  fileCount: number;
  permissions: Array<string>;
  identifier: string;
  icon: string;
}
