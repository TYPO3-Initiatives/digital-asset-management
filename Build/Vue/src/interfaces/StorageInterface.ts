import FolderTreeNode from '@/interfaces/FolderTreeNode';

export interface StorageInterface {
    folders: Array<FolderTreeNode>;
    title: string;
    identifier: string;
}
