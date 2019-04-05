import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Mutation} from 'vuex-class';
import {SortingFields, SortingOrder} from '@/enums/Sorting';
import {Mutations} from '@/enums/Mutations';

@Component
export default class SortingSelector extends Vue {
    @Mutation(Mutations.CHANGE_SORTING)
    changeSorting: any;

    @Mutation(Mutations.CHANGE_SORTORDER)
    changeSortOrder: any;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        return (
            <div class='form-inline'>
                <div class='form-group'>
                    <select class='form-control' onChange={(e: Event) => this.changeSorting((e.target as HTMLSelectElement).value)}>
                    {Object.values(SortingFields).map((field: String) => {
                        return <option>{field}</option>;
                    })}
                    </select>
                    <select class='form-control' onChange={(e: Event) => this.changeSortOrder((e.target as HTMLSelectElement).value)}>
                    {Object.values(SortingOrder).map((field: String) => {
                        return <option>{field}</option>;
                    })}
                    </select>
                </div>
            </div>
        );
    }
}
