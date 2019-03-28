import {ResourcePermissionsInterface} from '@/interfaces/ResourcePermissionsInterface';

export interface FolderInterface {
  type: string;
  name: string;
  mtime: number;
  mtimeDisplay: string;
  itemCount: number;
  permissions: ResourcePermissionsInterface;
  identifier: string;
  icon: string;
}
