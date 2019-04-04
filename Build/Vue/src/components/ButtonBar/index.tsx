import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {Action, Mutation, State} from 'vuex-class';
import {AjaxRoutes} from '@/enums/AjaxRoutes';
import {Mutations} from '@/enums/Mutations';
import {ResourceInterface} from '@/interfaces/ResourceInterface';
import {FileServiceEvent} from '@/enums/FileServiceEvent';

@Component
export default class ButtonBar extends Vue {
  @Action(AjaxRoutes.damGetFolderItems)
  fetchData: any;

  @Mutation(Mutations.SET_MODAL_CONTENT)
  setModalContent!: Function;

  @Mutation(Mutations.NAVIGATE)
  navigate!: Function;

  @State
  selected!: Array<ResourceInterface>;

  @State
  current!: string;

  constructor(props: any) {
    super(props);
  }

  private render(): VNode {
    const disabled = this.selected.length === 0;
    const cssClasses = 'btn btn-default' + (disabled ? ' disabled' : '');
    const moveResources = (e: Event) => {
      e.stopPropagation();
      let event = new CustomEvent('fileServiceEvent', {
        detail: {
          'event': FileServiceEvent.MOVE_TO,
        },
      });
      document.dispatchEvent(event);
    };
    const copyResources = (e: Event) => {
      e.stopPropagation();
      let event = new CustomEvent('fileServiceEvent', {
        detail: {
          'event': FileServiceEvent.COPY_TO,
        },
      });
      document.dispatchEvent(event);
    };
    const deleteResources = (e: Event) => {
      e.stopPropagation();
      let event = new CustomEvent('fileServiceEvent', {
        detail: {
          'event': FileServiceEvent.DELETE,
        },
      });
      document.dispatchEvent(event);
    };
    const downloadResources = (e: Event) => {
      e.stopPropagation();
      let event = new CustomEvent('fileServiceEvent', {
        detail: {
          'event': FileServiceEvent.DOWNLOAD,
        },
      });
      document.dispatchEvent(event);
    };
    return (
      <div class='btn-group'>
        <a href='#' class={cssClasses} disabled={disabled} onClick={downloadResources}><i class='fa fa-download'/> Download</a>
        <a href='#' class={cssClasses} disabled={disabled} onClick={deleteResources}><i class='fa fa-trash'/> Delete</a>
        <a href='#' class={cssClasses} disabled={disabled} onClick={moveResources}><i class='fa fa-crosshairs'/> Move to</a>
        <a href='#' class={cssClasses} disabled={disabled} onClick={copyResources}><i class='fa fa-clipboard'/> Copy to</a>
      </div>
    );
  }
}
