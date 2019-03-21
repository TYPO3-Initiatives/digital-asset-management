export interface RootState {
    selected: Array<String>; // Array<String == FileIdentifier>
    itemsGrouped: any; // Object<{files,folders,images}>
    items: any; // Array<File>
    current: String; // current identifier
    viewMode: String; // LIST_VIEW|TILE_VIEW
    sorting: any;
    showTree: boolean;
}
