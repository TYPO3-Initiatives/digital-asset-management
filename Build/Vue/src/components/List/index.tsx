import {Prop, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {State} from 'vuex-class';
import Tile from '@/components/Tile';
import Component from 'vue-class-component';
import ListItem from '@/components/ListItem';
import AllSelector from '@/components/AllSelector';

@Component
export default class List extends Vue {
    @Prop()
    items: any;

    @Prop()
    click!: Function;

    @State
    current: any;

    constructor(props: any) {
        super(props);
    }

    private getFirstItem(): {} {
        return this.items[0] ? this.items[0] : {};
    }

    private render(): VNode {
        const list = this.items.map(this.generateListItem, this);
        const headline = Object.keys(this.getFirstItem()).map((key: String) => <th>{key}</th>);
        return (
            <div class='panel panel-default'>
                <table class='table table-striped table-hover'>
                    <thead>
                        <th><AllSelector listOfIdentifiers={this.items.map((item: any) => {return item.identifier; })}/></th>
                        {headline}
                    </thead>
                    <tbody>{list}</tbody>
                </table>
            </div>
        );
    }

    private generateListItem(item: any): VNode {
        return (
            <ListItem
                identifier={item.identifier}
                item={item}
                click={this.click}
            />
        );
    }
}
