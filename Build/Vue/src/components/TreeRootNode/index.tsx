import {AjaxRoutes} from '@/enums/AjaxRoutes';
import {StorageInterface} from '@/interfaces/StorageInterface';
import {CreateElement, VNode} from 'vue';
import {Action, State} from 'vuex-class';
import {Component, Vue} from 'vue-property-decorator';

@Component
export default class TreeNode extends Vue {
    @Action(AjaxRoutes.damGetFolderItems)
    fetchData: any;

    @State
    storage!: StorageInterface;

    constructor(props: any) {
        super(props);
    }

    private render(h: CreateElement): VNode {
        return(
            <span class='list-tree-group' data-identifier={this.storage.identifier}>
                <a href='#' data-identifier={this.storage.identifier} onclick={() => this.fetchData(this.storage.identifier)}>
                    <img src={this.storage.icon} width='16' height='16' /> {this.storage.title}
                </a>
            </span>
        );
    }
}
