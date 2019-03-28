import {Prop, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {State} from 'vuex-class';
import Tile from '@/components/Tile';
import Component from 'vue-class-component';

@Component
export default class Tiles extends Vue {
    @Prop()
    items: any;

    @Prop()
    click!: Function;

    @State
    current: any;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        const tiles = this.items.map(this.generateTile, this);
        return (
            <div class='tiles'>
                <div v-show={this.items.length > 0}>
                {tiles}
                </div>
            </div>
        );
    }

    private generateTile(item: any): VNode {
        return (
            <Tile item={item} click={this.click} />
        );
    }
}
