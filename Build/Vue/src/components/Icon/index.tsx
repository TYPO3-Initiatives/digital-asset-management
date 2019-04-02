import {VNode} from 'vue';
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component
export default class Icon extends Vue {
    @Prop()
    markup!: string;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        return(
            <span domPropsInnerHTML={this.markup}></span>
        );
    }
}
