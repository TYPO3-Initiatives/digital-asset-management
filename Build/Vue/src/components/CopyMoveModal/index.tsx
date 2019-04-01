import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Action, Mutation, State} from 'vuex-class';
import {AjaxRoutes} from '@/enums/AjaxRoutes';
import Tree from '@/components/Tree';
import {ResourceInterface} from '@/interfaces/ResourceInterface';
import {Mutations} from '@/enums/Mutations';
import {FileType} from '@/enums/FileType';
import {ImageInterface} from '@/interfaces/ImageInterface';
import {FolderInterface} from '@/interfaces/FolderInterface';
import {FileInterface} from '@/interfaces/FileInterface';
import Icon from '@/components/Icon';
import {StorageInterface} from '@/interfaces/StorageInterface';

@Component
export default class CopyMoveModal extends Vue {
  @Mutation(Mutations.UNSELECT_ITEM)
  unselectItem: any;

  @Action(AjaxRoutes.damMoveResources)
  moveResources: any;

  @Action(AjaxRoutes.damCopyResources)
  copyResources: any;

  @State
  selected!: Array<ResourceInterface>;

  @State
  activeStorage!: StorageInterface;

  constructor(props: any) {
    super(props);
  }

  private render(): VNode {
    const selectedItems: VNode = this.renderSelectedItemList();
    return (
      <div class='row'>
        <div class='col-xs-6'>
          {selectedItems}
        </div>
        <div class='col-xs-6'>
          <Tree storage={this.activeStorage} selectCallBack={(identifier: string) => { console.log(identifier); }} />
        </div>
      </div>
    );
  }

  private renderSelectedItemList(): VNode {
    const selectedItems: Array<VNode> = [];
    for (let i = 0; i < this.selected.length; i++) {
      selectedItems.push(this.renderSelectedItem(this.selected[i]));
    }
    const currentPath: string = 'Coming soon...';
    return (
      <div class='component-selected-items-list'>
        <p>
          Move {this.selected.length} Elements to<br />
          <strong>{currentPath}</strong>
        </p>
        {selectedItems}
      </div>
    );
  }

  private renderSelectedItem(item: ResourceInterface): VNode {
    switch (item.type) {
      case FileType.FILE:
        return this.renderFileItem(item as FileInterface);
      case FileType.FOLDER:
        return this.renderFolderItem(item as FolderInterface);
      case FileType.IMAGE:
        return this.renderImageItem(item as ImageInterface);
      default:
        throw Error('unknown type');
    }
  }

  private renderFileItem(item: FileInterface): VNode {
    const clickFunction = (e: Event) => {
      e.stopPropagation();
      this.unselectItem(item);
    };
    return (
      <div class='component-selected-items-list-item'>
        <div class='component-selected-items-list-item-icon'>
          <Icon identifier={item.iconIdentifier} />
        </div>
        <div class='component-selected-items-list-item-data'>
          {item.name}<br/>
          <small>{item.mtimeDisplay}</small>
        </div>
        <div class='component-selected-items-list-item-action'>
          <a href='#' onClick={clickFunction}>X</a>
        </div>
      </div>
    );
  }

  private renderFolderItem(item: FolderInterface): VNode {
    const clickFunction = (e: Event) => {
      e.stopPropagation();
      this.unselectItem(item);
    };
    return (
      <div class='component-selected-items-list-item'>
        <div class='component-selected-items-list-item-icon'>
          <img src={item.icon} width='32' height='32' />
        </div>
        <div class='component-selected-items-list-item-data'>
          {item.name}<br/>
          <small>{item.mtimeDisplay}</small>
        </div>
        <div class='component-selected-items-list-item-action'>
          <a href='#' onClick={clickFunction}>X</a>
        </div>
      </div>
    );
  }

  private renderImageItem(item: ImageInterface): VNode {
    const clickFunction = (e: Event) => {
      e.stopPropagation();
      this.unselectItem(item);
    };
    return (
      <div class='component-selected-items-list-item'>
        <div class='component-selected-items-list-item-icon'>
          <img src={item.thumbnailUrl} height='32' />
        </div>
        <div class='component-selected-items-list-item-data'>
          {item.name}<br/>
          <small>{item.mtimeDisplay}</small>
        </div>
        <div class='component-selected-items-list-item-action'>
          <a href='#' onClick={clickFunction}>X</a>
        </div>
      </div>
    );
  }
}
