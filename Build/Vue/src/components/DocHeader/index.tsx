import {Component, Vue} from 'vue-property-decorator';
import {VNode} from 'vue';

@Component
export default class DocHeader extends Vue {
    constructor(props: any) {
        super(props);
    }

    private render(): VNode {
        const classes = `module-docheader-bar module-docheader-bar-navigation t3js-module-docheader-bar
                        t3js-module-docheader-bar-navigation row`;
        return (
            <div class='module-docheader t3js-module-docheader'>
                <div
                    class={classes}>
                    <div class='module-docheader-bar-column-left'>
                        {this.$slots.topBarLeft}
                    </div>
                    <div class='module-docheader-bar-column-right'>
                        {this.$slots.topBarRight}
                    </div>
                </div>
                <div class='module-docheader-bar module-docheader-bar-buttons t3js-module-docheader-bar t3js-module-docheader-bar-buttons'>
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
