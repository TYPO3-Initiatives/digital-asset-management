import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Action, State} from 'vuex-class';
import {AjaxRoutes} from '@/enums/AjaxRoutes';

@Component
export default class Breadcrumb extends Vue {

    get getSplittedPath(): Array<string> {
        let items: Array<string> = [];
        this.current.split('/').map((item, index) => {
           if (item !== '') {
               items.push(item);
           }
        });
        return items;
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
        let labels: Array<string> = this.getSplittedPath;
        const items = labels.map((item, index) => {
            currentIdentifier += item + '/';
            return this.renderBreadcrumbItem(item, currentIdentifier, (labels.length - 1 === index));
        });
        const ariaLabel =
          TYPO3.lang['Breadcrumb.current_folder_description']
          + labels.reverse().join(' ' + TYPO3.lang['Breadcrumb.current_folder_description_glue_word'] + ' ');

        return (
          <nav class='component-breadcrumb' aria-label={ariaLabel}>
              <ul class='component-breadcrumb-list' role='menu'>
                {items}
              </ul>
          </nav>
        );
    }

    private renderBreadcrumbItem(item: string, currentIdentifier: string, lastElement: boolean): VNode {
        let clickFolder: Function = (event: Event) => {
            event.stopPropagation();
            const identifier: string = (event.currentTarget as HTMLElement).dataset.identifier || '';
            this.openFolder(identifier);
        };
        if (lastElement) {
          return (
            <li class='component-breadcrumb-item'>
              <a class='component-breadcrumb-link' role='menuitem' title={item} href='#' onClick={clickFolder}
                data-identifier={currentIdentifier} aria-current='page'>
                <span class='component-breadcrumb-link-text'>{item}</span>
              </a>
            </li>
          );
        } else {
          return (
            <li class='component-breadcrumb-item'>
              <a class='component-breadcrumb-link' role='menuitem' title={item} href='#' onClick={clickFolder}
                data-identifier={currentIdentifier}>
                <span class='component-breadcrumb-link-text'>{item}</span>
              </a>
            </li>
          );
        }
    }
}
