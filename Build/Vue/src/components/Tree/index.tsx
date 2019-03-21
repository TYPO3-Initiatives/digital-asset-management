import {Component, Vue} from 'vue-property-decorator';
import {CreateElement, VNode} from 'vue';
// query: tree
// render TYPO3 SVG Tree component

@Component
export default class Tree extends Vue {
    constructor(props: any) {
        super(props);
    }
    private render(h: CreateElement): VNode {
        return (
            <div>Tree</div>
        );
    }
}
