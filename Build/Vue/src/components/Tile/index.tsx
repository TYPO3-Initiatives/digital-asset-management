import {Component, Prop, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {State} from 'vuex-class';
import ItemSelector from '@/components/ItemSelector';
import {FileType} from '@/enums/FileType';

@Component
export default class Tile extends Vue {

    get isSelected(): boolean {
        return this.selected.includes(this.identifier);
    }

    @State
    selected!: Array<object>;

    @Prop()
    identifier!: String;

    @Prop()
    header!: String;

    @Prop()
    fileCount!: Number;

    @Prop()
    type!: String;

    @Prop()
    icon!: String;

    @Prop()
    mtime!: Number;

    @Prop()
    mtimeDisplay!: String;

    @Prop()
    thumbnail!: String;

    @Prop()
    click!: Function;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        if (this.type === FileType.FOLDER) {
            return this.renderFolder();
        }
        if (this.thumbnail !== null) {
            return this.renderImage();
        }
        return this.renderFile();
    }

    private renderFolder(): VNode {
        let classes = 'tile tile-' + this.type;
        if (this.isSelected) {
            classes += ' selected';
        }
        // noop
        let onClick = () => null;
        if (this.click) {
            onClick = () => this.click(this.identifier, this.type);
        }
        return (
          <div class={classes}
            onClick={onClick}
            data-identifier={this.identifier}
          >
              <div class='tile-content'>
                  <span class='pull-right'><ItemSelector identifier={this.identifier}/></span>
                  <span class='tile-image-container'>
                        <img src={this.icon} class='tile-image'/>
                        <span class='tile-image-meta file-count' v-show={this.fileCount}>{this.fileCount}</span>
                    </span>
              </div>
              <div className='tile-title'>
                  <span class='tile-header'>{this.header}</span><br/>
                  <span class='tile-image-meta file-mtime' v-show={this.mtimeDisplay}>{this.mtimeDisplay}</span>
              </div>
          </div>
        );
    }

    private renderFile(): VNode {
        let classes = 'tile tile-' + this.type;
        if (this.isSelected) {
            classes += ' selected';
        }
        // noop
        let onClick = () => null;
        if (this.click) {
            onClick = () => this.click(this.identifier, this.type);
        }
        return (
          <div class={classes}
            onClick={onClick}
            data-identifier={this.identifier}
          >
              <div class='tile-content'>
                  <span class='pull-right'><ItemSelector identifier={this.identifier}/></span>
                  <span class='tile-image-container'>
                        <img src={this.icon} class='tile-image'/>
                    </span>
              </div>
              <div className='tile-title'>
                  <span class='tile-header'>{this.header}</span><br/>
                  <span class='tile-image-meta file-mtime' v-show={this.mtimeDisplay}>{this.mtimeDisplay}</span>
              </div>
          </div>
        );
    }

    private renderImage(): VNode {
        let classes = 'tile tile-' + this.type;
        if (this.isSelected) {
            classes += ' selected';
        }
        // noop
        let onClick = () => null;
        if (this.click) {
            onClick = () => this.click(this.identifier, this.type);
        }
        return (
          <div class={classes}
            onClick={onClick}
            data-identifier={this.identifier}
          >
             <div class='tile-content'>
                <span class='pull-right'><ItemSelector identifier={this.identifier}/></span>
                <span class='tile-image-container'>
                  <img src={this.thumbnail} class='tile-thumbnail'/>
                </span>
              </div>
          </div>
        );
    }
}
