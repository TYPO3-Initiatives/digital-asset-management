import {ResourceInterface} from '@/interfaces/ResourceInterface';

export interface FolderInterface extends ResourceInterface {
  itemCount: number;
  icon: string;
}
