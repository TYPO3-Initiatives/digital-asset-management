import {ResourceInterface} from '@/interfaces/ResourceInterface';

export interface CopyMoveRequestInterface {
  resources: Array<ResourceInterface>;
  target: string;
}
