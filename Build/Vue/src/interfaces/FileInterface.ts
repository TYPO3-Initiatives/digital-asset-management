import {ResourcePermissionsInterface} from '@/interfaces/ResourcePermissionsInterface';

export interface FileInterface {
  type: string;
  name: string;
  mtime: number;
  mtimeDisplay: string;
  size: number;
  sizeDisplay: string;
  extension: string;
  translations: Array<any>;
  references: number;
  permissions: ResourcePermissionsInterface;
  identifier: string;
  iconIdentifier: string;
  editMetaUrl: string;
  editContentUrl: string;
}
