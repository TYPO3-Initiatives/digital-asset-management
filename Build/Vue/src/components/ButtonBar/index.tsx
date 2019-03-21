import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';

@Component
export default class ButtonBar extends Vue {
    constructor(props: any) {
        super(props);
    }
    private render(): VNode {
        return (
            <div><button>ButtonBar</button></div>
        );
    }
}
