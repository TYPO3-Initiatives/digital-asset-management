export default interface FolderTreeNode {
    text: string;
    identifier: string;
    icon: any;
    expanded: boolean;
    hasChildren: boolean;
    children: Array<FolderTreeNode>;
}
