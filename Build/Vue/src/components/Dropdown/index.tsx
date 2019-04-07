import {VNode} from 'vue';
import {Component, Prop, Vue} from 'vue-property-decorator';
import Icon from '@/components/Icon';

@Component
export default class Dropdown extends Vue {
    @Prop()
    toggleLabel!: string;

    @Prop()
    toggleLabelIconIdentifier!: string;

    @Prop()
    toggleTitle!: string;

    @Prop()
    toggleAriaLabel!: string;

    constructor(props: any) {
        super(props);
    }

    private static toggleDropdown(e: Event): void {
        const me = (e.target as HTMLElement);
        const dropdown = me.closest('.component-dropdown');
        if (dropdown === null) {
            return;
        }

        const dropdownToggle = dropdown.querySelector('.component-dropdown-toggle');
        if (dropdownToggle !== null) {
            let isActive = dropdownToggle.getAttribute('aria-expanded') === 'true';
            dropdownToggle.setAttribute('aria-expanded', (!isActive).toString());
        }
    }

    private render(): VNode {
        const toggleLabelIcon = this.toggleLabelIconIdentifier ? (
            <span class='component-dropdown-toggle-icon' role='presentation'>
                <Icon identifier={this.toggleLabelIconIdentifier} />
            </span>
        ) : '';
        const toggleLabel = this.toggleLabel ? (
            <span class='component-dropdown-toggle-text'>
                {this.toggleLabel}
            </span>
        ) : '';

        return (
            <span class='component-dropdown'>
                <button
                    type='button'
                    class='component-dropdown-toggle'
                    title={this.toggleTitle}
                    aria-haspopup='true'
                    aria-expanded='false'
                    aria-label={this.toggleAriaLabel}
                    onclick={Dropdown.toggleDropdown}
                >
                    {toggleLabelIcon}
                    {toggleLabel}
                    <span class='component-dropdown-toggle-icon' role='presentation'>
                        <Icon identifier='apps-pagetree-expand' />
                    </span>
                </button>
                <div class='component-dropdown-container'>
                    {this.$slots.default}
                </div>
            </span>
        );
    }
}
