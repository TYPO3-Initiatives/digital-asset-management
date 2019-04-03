import FolderTreeNode from '@/interfaces/FolderTreeNode';
import {StorageInterface} from '@/interfaces/StorageInterface';
import {GroupedResourcesInterface} from '@/interfaces/GroupedResourcesInterface';
import {VNode} from 'vue';

export interface RootState {
    selected: Array<String>; // Array<String == FileIdentifier>
    itemsGrouped: GroupedResourcesInterface;
    items: any; // Array<File>
    current: String; // current identifier
    viewMode: String; // LIST_VIEW|TILE_VIEW
    sorting: any;
    showTree: boolean;
    activeStorage: StorageInterface | null;
    treeFolders: Array<FolderTreeNode>;
    storages: Array<StorageInterface> | null;
    treeIdentifierLocationMap: {[key: string]: Array<number>};
    modalContent: VNode | null;
}

declare global {
    const TYPO3: any;
    interface Window { TYPO3: any; }
}

window.TYPO3 = window.TYPO3 || {};
