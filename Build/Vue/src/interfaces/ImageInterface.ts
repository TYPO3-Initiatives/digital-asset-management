import {FileInterface} from '@/interfaces/FileInterface';

export interface ImageInterface extends FileInterface {
  thumbnailUrl: string;
}
