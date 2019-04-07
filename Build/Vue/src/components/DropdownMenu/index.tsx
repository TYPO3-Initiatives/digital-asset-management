import Icon from '@/components/Icon';
import {LinkInterface} from '@/interfaces/LinkInterface';
import {VNode} from 'vue';
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component
export default class DropdownMenu extends Vue {
    @Prop()
    entries!: Array<LinkInterface>;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode | null {
        if (!this.entries.length) {
            return null;
        }

        const menuItems = this.entries.map(this.generateItem, this);
        return (
            <ul class='component-dropdown-menu' role='menu'>
                {menuItems}
            </ul>
        );
    }

    private generateItem(link: LinkInterface): VNode {
        return(
            <li class='component-dropdown-menu-item'>
                <a
                    class='component-dropdown-menu-link'
                    title={link.title}
                    href={link.href}
                    onclick={link.onclick}
                    data-identifier={link.dataIdentifier}
                >
                    <span class='component-dropdown-menu-link-icon' role='presentation'>
                        <Icon identifier={link.iconIdentifier} />
                    </span>
                    <span class='component-dropdown-menu-link-text'>{link.title}</span>
                </a>
            </li>
        );
    }
}
