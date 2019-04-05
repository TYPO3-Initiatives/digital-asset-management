import {ResourceInterface} from '@/interfaces/ResourceInterface';

export interface FileInterface extends ResourceInterface {
  size: number;
  sizeDisplay: string;
  extension: string;
  translations: Array<any>;
  references: number;
  iconIdentifier: string;
  editMetaUrl: string;
  editContentUrl: string;
}
