import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Mutation, State} from 'vuex-class';
import {ViewType} from '@/enums/ViewType';
import {Mutations} from '@/enums/Mutations';

@Component
export default class ViewSelector extends Vue {

    get currentViewMode(): String {
        return this.viewMode;
    }

    @Mutation(Mutations.SWITCH_VIEW)
    switch: any;

    @State
    viewMode!: String;
    constructor(props: any) {
        super(props);
    }

    private changeView(newView: String): void {
        this.switch(newView);
    }

    private render(): VNode {
        const tileSelected: string = this.currentViewMode === ViewType.TILE ? 'active' : '';
        const listSelected: string = this.currentViewMode === ViewType.LIST ? 'active' : '';
        return (
            <div class='btn-group' role='group'>
                <button class={'btn btn-default ' + listSelected} onclick={(event: Event) => this.changeView(ViewType.LIST)}>
                    <i class='fa fa-fw fa-list' />
                </button>
                <button class={'btn btn-default ' + tileSelected} onclick={(event: Event) => this.changeView(ViewType.TILE)}>
                    <i class='fa fa-fw fa-th' />
                </button>
            </div>
        );
    }
}
