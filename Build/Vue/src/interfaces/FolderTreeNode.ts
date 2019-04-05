export default interface FolderTreeNode {
    name: string;
    identifier: string;
    icon: any;
    expanded: boolean;
    selected: boolean;
    hasChildren: boolean;
    folders: Array<FolderTreeNode>;
}
