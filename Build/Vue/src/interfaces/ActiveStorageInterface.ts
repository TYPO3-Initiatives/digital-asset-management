import FolderTreeNode from '@/interfaces/FolderTreeNode';
import {StorageInterface} from '@/interfaces/StorageInterface';

export interface ActiveStorageInterface {
    folders: Array<FolderTreeNode>;
    storage: StorageInterface;
}
