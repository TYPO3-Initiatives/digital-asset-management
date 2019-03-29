import {Component, Prop, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Action, State} from 'vuex-class';
import ItemSelector from '@/components/ItemSelector';
import {FileType} from '@/enums/FileType';
import {FolderInterface} from '@/interfaces/FolderInterface';
import {FileInterface} from '@/interfaces/FileInterface';
import {ImageInterface} from '@/interfaces/ImageInterface';
import {AjaxRoutes} from '@/enums/AjaxRoutes';
import {ResourceInterface} from '@/interfaces/ResourceInterface';

@Component
export default class Tile extends Vue {
    @Action(AjaxRoutes.damGetFolderItems)
    fetchData: any;

    @State
    selected!: Array<object>;

    @Prop()
    item!: ResourceInterface;

    constructor(props: any) {
        super(props);
    }

    get isSelected(): boolean {
        return this.selected.includes(this.item);
    }

    private openFolder(identifier: String): void {
        this.fetchData(identifier);
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
        return (
            <div class={classes} onClick={this.openFolder(item.identifier)} data-identifier={item.identifier}>
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
        return (
            <a class={classes} href={item.editMetaUrl} data-identifier={item.identifier}>
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
            </a>
        );
    }

    private renderImage(item: ImageInterface): VNode {
        let classes = 'tile tile-' + item.type;
        if (this.isSelected) {
            classes += ' selected';
        }
        return (
            <div class={classes} data-identifier={item.identifier}>
                <div class='tile-content'>
                    <span class='pull-right'><ItemSelector identifier={item.identifier}/></span>
                    <span class='tile-image-container'>
                        <a href={item.editMetaUrl}><img src={item.thumbnailUrl} class='tile-thumbnail'/></a>
                    </span>
                </div>
            </div>
        );
    }
}
