import {Component, Prop, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';

@Component
export default class Overlay extends Vue {
    @Prop()
    content!: VNode;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode | null {
        return (
            <div class='overlay'>
                <div class='overlay-backdrop'>
                    <div class='overlay-content'>
                        {this.content}
                    </div>
                </div>
            </div>
        );
    }
}
