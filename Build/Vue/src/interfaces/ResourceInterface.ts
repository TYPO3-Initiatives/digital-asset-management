import {ResourcePermissionsInterface} from '@/interfaces/ResourcePermissionsInterface';

export interface ResourceInterface {
  type: string;
  identifier: string;
  name: string;
  mtime: number;
  mtimeDisplay: string;
  permissions: ResourcePermissionsInterface;
  [key: string]: any;
}
