import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Mutation, State} from 'vuex-class';
import {LIST_VIEW, SWITCH_VIEW, TILE_VIEW} from '@/store/mutations';

@Component
export default class ViewSelector extends Vue {

    get currentViewMode(): String {
        return this.viewMode;
    }

    @Mutation(SWITCH_VIEW)
    switch: any;

    @State
    viewMode!: String;
    constructor(props: any) {
        super(props);
    }

    private changeView(newView: String): void {
        this.switch(newView);
    }

    private getTileViewSelected(): VNode {
        return (
            <select onChange={(event: Event) => this.changeView((event.target as HTMLSelectElement).value)}>
                <option value={TILE_VIEW} selected>Tiles</option>
                <option value={LIST_VIEW}>List</option>
            </select>
        );
    }

    private getListViewSelected(): VNode {
        return (
            <select onChange={(event: Event) => this.changeView((event.target as HTMLSelectElement).value)}>
                <option value={TILE_VIEW}>Tiles</option>
                <option value={LIST_VIEW} selected>List</option>
            </select>
        );
    }

    private render(): VNode {
        let options;
        if (this.currentViewMode === TILE_VIEW) {
            options = this.getTileViewSelected();
        } else {
            options = this.getListViewSelected();
        }
        return (
            <div>
                {options}
            </div>
        );
    }
}
