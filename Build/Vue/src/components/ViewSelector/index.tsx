import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Mutation, State} from 'vuex-class';
import {SWITCH_VIEW} from '@/store/mutations';
import {ViewType} from '@/enums/ViewType';

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
                <option value={ViewType.TILE} selected>Tiles</option>
                <option value={ViewType.LIST}>List</option>
            </select>
        );
    }

    private getListViewSelected(): VNode {
        return (
            <select onChange={(event: Event) => this.changeView((event.target as HTMLSelectElement).value)}>
                <option value={ViewType.TILE}>Tiles</option>
                <option value={ViewType.LIST} selected>List</option>
            </select>
        );
    }

    private render(): VNode {
        let options;
        if (this.currentViewMode === ViewType.TILE) {
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
