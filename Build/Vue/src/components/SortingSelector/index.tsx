import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Mutation} from 'vuex-class';
import {CHANGE_SORTING, CHANGE_SORTORDER} from '@/store/mutations';
import {SortingFields, SortingOrder} from '@/enums/Sorting';

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
