export interface RootState {
    selected: Array<String>; // Array<String == FileIdentifier>
    itemsGrouped: any; // Object<{files,folders,images}>
    items: any; // Array<File>
    current: String; // current identifier
    viewMode: String; // LIST_VIEW|TILE_VIEW
    sorting: any;
    showTree: boolean;
    tree: any;
    treeIdentifierLocationMap: {[key: string]: Array<number>};
}

declare global {
    interface Window { TYPO3: any; }
}

window.TYPO3 = window.TYPO3 || {};

declare global {
    const TYPO3: any;
}
