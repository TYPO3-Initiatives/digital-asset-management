import {FileInterface} from './FileInterface';
import {FolderInterface} from './FolderInterface';
import {ImageInterface} from './ImageInterface';

export interface GroupedResourcesInterface {
  files: Array<FileInterface>;
  folders: Array<FolderInterface>;
  images: Array<ImageInterface>;
}
