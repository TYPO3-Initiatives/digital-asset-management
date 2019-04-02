export default interface FolderTreeNode {
    name: string;
    identifier: string;
    icon: any;
    expanded: boolean;
    hasChildren: boolean;
    folders: Array<FolderTreeNode>;
}
