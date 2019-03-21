import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {SORT_FIELDS, SORT_ORDER} from '@/components/SortingSelector/SortOptions';
import {Mutation} from 'vuex-class';
import {CHANGE_SORTING, CHANGE_SORTORDER} from '@/store/mutations';

@Component
export default class SortingSelector extends Vue {
    @Mutation(CHANGE_SORTING)
    changeSorting: any;

    @Mutation(CHANGE_SORTORDER)
    changeSortOrder: any;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        return (
            <div><select onChange={(e: Event) => this.changeSorting((e.target as HTMLSelectElement).value)}>
                {Object.values(SORT_FIELDS).map((field: String) => {
                    return <option>{field}</option>;
                })}
            </select><select onChange={(e: Event) => this.changeSortOrder((e.target as HTMLSelectElement).value)}>
                {Object.values(SORT_ORDER).map((field: String) => {
                    return <option>{field}</option>;
                })}
            </select>
            </div>
        );
    }
}
