import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';
import {State} from 'vuex-class';

@Component
export default class Breadcrumb extends Vue {

    get breadCrumb(): string {
        return this.current.split('/').join(' > ');
    }

    @State
    current!: String;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        return (
            <div>{this.breadCrumb}</div>
        );
    }
}
