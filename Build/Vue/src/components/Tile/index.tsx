import Icon from '@/components/Icon';
import {Mutations} from '@/enums/Mutations';
import {StorageInterface} from '@/interfaces/StorageInterface';
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

    @Action(Mutations.SET_STORAGE)
    setStorage!: Function;

    @State
    selected!: Array<object>;

    @Prop()
    item!: ResourceInterface | StorageInterface;

    constructor(props: any) {
        super(props);
    }

    get isSelected(): boolean {
        return this.selected.includes(this.item);
    }

    private openFolder(identifier: String): void {
        this.fetchData(identifier);
    }

    private openStorage(identifier: number): void {
        this.setStorage(identifier);
    }

    private render(): VNode {
        if (this.item.type === FileType.STORAGE) {
            return this.renderStorage(this.item as StorageInterface);
        }
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

    private renderStorage(item: StorageInterface): VNode {
        let classes = 'component-tile component-tile-' + item.type;
        if (this.isSelected) {
            classes += ' component-tile-selected';
        }
        const clickFunction = (e: Event) => {
            e.stopPropagation();
            this.openStorage(item.identifier);
        };

        return (
            <a
                class={classes}
                href='#'
                title={item.name}
                onClick={clickFunction}
                data-identifier={item.identifier}
                data-connectivity={item.storageOnline ? 'online' : 'offline'}
            >
                <div class='component-tile-icon'>
                    <Icon identifier={item.icon} size='large' />
                </div>
                <div class='component-tile-info'>
                    <div class='component-tile-info-name'>{item.name}</div>
                    <div class='component-tile-info-meta'>{item.type}</div>
                </div>
            </a>
        );
    }

    private renderFolder(item: FolderInterface): VNode {
        let classes = 'component-tile component-tile-' + item.type;
        if (this.isSelected) {
            classes += ' component-tile-selected';
        }
        const clickFunction = (e: Event) => {
            e.stopPropagation();
            this.openFolder(item.identifier);
        };
        return (
            <a
                class={classes}
                href='#'
                title={item.name}
                onClick={clickFunction}
                data-identifier={item.identifier}
            >
                <div class='component-tile-content'>
                    <span class='component-tile-image-container'>
                        <img src={item.icon} class='tile-image'/>
                        <span class='tile-image-meta file-count' v-show={item.itemCount}>{item.itemCount}</span>
                    </span>
                </div>
                <div class='component-tile-info'>
                    <div class='component-tile-info-name'>{item.name}</div>
                    <div class='component-tile-info-meta' v-show={item.mtimeDisplay}>{item.mtimeDisplay}</div>
                </div>
                <div class='component-tile-selector'>
                    <ItemSelector item={item}/>
                </div>
            </a>
        );
    }

    private renderFile(item: FileInterface): VNode {
        let classes = 'component-tile component-tile-' + item.type;
        if (this.isSelected) {
            classes += ' component-tile-selected';
        }
        return (
            <a
                class={classes}
                href={item.editMetaUrl}
                title={item.name}
                data-identifier={item.identifier}
            >
                <div class='component-tile-icon'>
                    <Icon identifier={item.iconIdentifier} size='large' />
                </div>
                <div class='component-tile-info'>
                    <div class='component-tile-info-name'>{item.name}</div>
                    <div class='component-tile-info-meta' v-show={item.mtimeDisplay}>{item.mtimeDisplay}</div>
                </div>
                <div class='component-tile-selector'>
                    <ItemSelector item={item}/>
                </div>
            </a>
        );
    }

    private renderImage(item: ImageInterface): VNode {
        let classes = 'component-tile component-tile-' + item.type;
        if (this.isSelected) {
            classes += ' component-tile-selected';
        }
        return (
            <a
                href={item.editMetaUrl}
                class={classes}
                title={item.name}
                data-identifier={item.identifier}
            >
                <div class='component-tile-background'>
                    <img src={item.thumbnailUrl}/>
                </div>
                <div class='component-tile-info'>
                    <div class='component-tile-info-name'>{item.name}</div>
                    <div class='component-tile-info-meta' v-show={item.mtimeDisplay}>{item.mtimeDisplay}</div>
                </div>
                <div class='component-tile-selector'>
                    <ItemSelector item={item}/>
                </div>
            </a>
        );
    }
}
