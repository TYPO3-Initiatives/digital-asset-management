import {Prop, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {State} from 'vuex-class';
import Tile from '@/components/Tile';
import Component from 'vue-class-component';
import {ResourceInterface} from '@/interfaces/ResourceInterface';

@Component
export default class Tiles extends Vue {
    @Prop()
    items!: Array<ResourceInterface>;

    @State
    current: any;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode | null {
        const tiles = this.items.map(this.generateTile, this);
        return this.items.length > 0 ? (
            <div class='component-tile-list'>
                {tiles}
            </div>
        ) : null;
    }

    private generateTile(item: ResourceInterface): VNode {
        return (
            <Tile item={item} />
        );
    }
}
