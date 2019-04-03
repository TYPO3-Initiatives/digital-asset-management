import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {State} from 'vuex-class';

@Component
export default class ModalContent extends Vue {

    @State
    modalContent!: VNode;

    get contentForModal(): VNode {
        return this.modalContent;
    }

    private render(): VNode {
        return <div id='vue-modalContent'>{this.contentForModal}</div>;
    }
}
