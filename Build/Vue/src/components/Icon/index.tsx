import {VNode} from 'vue';
import {Component, Prop, Vue} from 'vue-property-decorator';
import Icons from 'TYPO3/CMS/Backend/Icons';

@Component
export default class Icon extends Vue {
    @Prop()
    identifier!: string;

    @Prop({default: 'small'})
    size!: string;

    private icon: VNode | null = null;

    constructor(props: any) {
        super(props);
    }

    async mounted(): Promise<any> {
        const iconRaw = await Icons.getIcon(this.$props.identifier, this.size, null, null, 'inline');
        this.icon = <span domPropsInnerHTML={iconRaw}></span>;
    }

    private render(): VNode | null {
        return this.icon;
    }
}
