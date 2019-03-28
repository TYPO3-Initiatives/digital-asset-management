import {Component, Prop, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {State} from 'vuex-class';
import ItemSelector from '@/components/ItemSelector';
import {FileType} from '@/enums/FileType';
import {FolderInterface} from '@/interfaces/FolderInterface';
import {FileInterface} from '@/interfaces/FileInterface';
import {ImageInterface} from '@/interfaces/ImageInterface';
import {ResourceInterface} from '@/interfaces/ResourceInterface';

@Component
export default class Tile extends Vue {

    get isSelected(): boolean {
        return this.selected.includes(this.item);
    }

    @State
    selected!: Array<object>;

    @Prop()
    item!: ResourceInterface;

    @Prop()
    click!: Function;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        if (this.item.type === FileType.FOLDER) {
            return this.renderFolder(this.item as FolderInterface);
        }
        if (this.item.type === FileType.IMAGE) {
            return this.renderImage(this.item as ImageInterface);
        }
        if (this.item.type === FileType.FILE) {
            return this.renderFile(this.item as FileInterface);
        }
        throw new Error('invalid resource type');
    }

    private renderFolder(item: FolderInterface): VNode {
        let classes = 'tile tile-' + item.type;
        if (this.isSelected) {
            classes += ' selected';
        }
        // noop
        let onClick = () => null;
        if (this.click) {
            onClick = () => this.click(item.identifier, item.type);
        }
        return (
          <div class={classes}
            onClick={onClick}
            data-identifier={item.identifier}
          >
              <div class='tile-content'>
                  <span class='pull-right'><ItemSelector identifier={item.identifier}/></span>
                  <span class='tile-image-container'>
                        <img src={item.icon} class='tile-image'/>
                        <span class='tile-image-meta file-count' v-show={item.itemCount}>{item.itemCount}</span>
                    </span>
              </div>
              <div className='tile-title'>
                  <span class='tile-header'>{item.name}</span><br/>
                  <span class='tile-image-meta file-mtime' v-show={item.mtimeDisplay}>{item.mtimeDisplay}</span>
              </div>
          </div>
        );
    }

    private renderFile(item: FileInterface): VNode {
        let classes = 'tile tile-' + item.type;
        if (this.isSelected) {
            classes += ' selected';
        }
        // noop
        let onClick = () => null;
        if (this.click) {
            onClick = () => this.click(item.identifier, item.type);
        }
        return (
          <div class={classes}
            onClick={onClick}
            data-identifier={item.identifier}
          >
              <div class='tile-content'>
                  <span class='pull-right'><ItemSelector identifier={item.identifier}/></span>
                  <span class='tile-image-container'>
                        <img src={item.iconIdentifier} class='tile-image'/>
                    </span>
              </div>
              <div className='tile-title'>
                  <span class='tile-header'>{this.item.name}</span><br/>
                  <span class='tile-image-meta file-mtime' v-show={item.mtimeDisplay}>{item.mtimeDisplay}</span>
              </div>
          </div>
        );
    }

    private renderImage(item: ImageInterface): VNode {
        let classes = 'tile tile-' + item.type;
        if (this.isSelected) {
            classes += ' selected';
        }
        // noop
        let onClick = () => null;
        if (this.click) {
            onClick = () => this.click(item.identifier, item.type);
        }
        return (
          <div class={classes}
            onClick={onClick}
            data-identifier={item.identifier}
          >
             <div class='tile-content'>
                <span class='pull-right'><ItemSelector identifier={item.identifier}/></span>
                <span class='tile-image-container'>
                  <img src={item.thumbnailUrl} class='tile-thumbnail'/>
                </span>
              </div>
          </div>
        );
    }
}
