import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Action, State} from 'vuex-class';
import StorageSelector from '@/components/StorageSelector';
import {AjaxRoutes} from '@/enums/AjaxRoutes';

@Component
export default class Breadcrumb extends Vue {

    get getSplittedPath(): Array<string> {
        return this.current.split('/');
    }

    @State
    current!: String;

    @Action(AjaxRoutes.damGetFolderItems)
    fetchData: any;

    constructor(props: any) {
        super(props);
    }

    private openFolder(identifier: String): void {
        this.fetchData(identifier);
    }

    private render(): VNode {
        let currentIdentifier = '';
        let clickFolder: Function = (event: Event) => {
            const identifier: string = (event.target as HTMLElement).dataset.identifier || '';
            this.openFolder(identifier);
        };
        const items = this.getSplittedPath.map((item, index) => {
            currentIdentifier += item + '/';
            return index > 0 && item !== ''
              ? <span class='breadcrumb-item' onClick={clickFolder} data-identifier={currentIdentifier}>{item}</span>
              : '';
        });
        return (
            <div class='breadcrumb'>
                <StorageSelector />
                {items}
            </div>
        );
    }
}
