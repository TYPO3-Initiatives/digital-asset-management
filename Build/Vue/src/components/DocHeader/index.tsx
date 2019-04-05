import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';

@Component
export default class DocHeader extends Vue {
    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        return (
            <div>
                <div class='module-docheader-bar'>
                    <div class='module-docheader-bar-column-left'>
                        {this.$slots.topBarLeft}
                    </div>
                    <div class='module-docheader-bar-column-right'>
                        {this.$slots.topBarRight}
                    </div>
                </div>
                <div class='module-docheader-bar'>
                    <div class='module-docheader-bar-column-left'>
                        {this.$slots.bottomBarLeft}
                    </div>
                    <div class='module-docheader-bar-column-right'>
                        {this.$slots.bottomBarRight}
                    </div>
                </div>
            </div>
        );
    }
}
