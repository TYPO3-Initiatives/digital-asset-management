import FolderTreeNode from '@/interfaces/FolderTreeNode';
import {StorageInterface} from '@/interfaces/StorageInterface';
import {GroupedResourcesInterface} from '@/interfaces/GroupedResourcesInterface';
import {VNode} from 'vue';
import {ResourceInterface} from '@/interfaces/ResourceInterface';

export interface RootState {
    selected: Array<ResourceInterface>;
    itemsGrouped: GroupedResourcesInterface;
    items: any; // Array<File>
    current: String; // current identifier
    viewMode: String; // LIST_VIEW|TILE_VIEW
    sorting: any;
    showTree: boolean;
    activeStorage: StorageInterface | null;
    treeFolders: Array<FolderTreeNode>;
    storages: Array<StorageInterface>;
    modalContent: VNode | null;
    treeIdentifierLocationMap: {[key: string]: Array<number>};
}

declare global {
    const TYPO3: any;

    interface Window {
        TYPO3: any;
        FormData: any;
    }
}

window.TYPO3 = window.TYPO3 || {};
