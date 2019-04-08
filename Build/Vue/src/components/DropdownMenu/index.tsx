import Icon from '@/components/Icon';
import {LinkInterface} from '@/interfaces/LinkInterface';
import {VNode} from 'vue';
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component
export default class DropdownMenu extends Vue {
    @Prop()
    entries!: Array<LinkInterface>;

    @Prop({default: false})
    activeIcon!: boolean;

    @Prop({default: false})
    secondary!: boolean;

    constructor(props: any) {
        super(props);
    }

    private render(): VNode | null {
        if (!this.entries.length) {
            return null;
        }
        const menuItems = this.entries.map(this.generateItem, this);
        let itemClass: string = 'component-dropdown-menu';
        itemClass += (this.secondary ? ' component-dropdown-menu-secondary' : '');
        itemClass += (this.activeIcon ? ' component-dropdown-menu-active' : '');
        return (
            <ul
                class={itemClass}
                role='menu'
            >
                {menuItems}
            </ul>
        );
    }

    private generateItem(link: LinkInterface): VNode {
        const icon: VNode | string = link.iconIdentifier
            ? <span class='component-dropdown-menu-link-icon'><Icon identifier={link.iconIdentifier} /></span>
            : '';
        let itemClass: string = 'component-dropdown-menu-item';
        itemClass += ' component-dropdown-menu-item-' + (link.active ? 'active' : 'inactive');
        return(
            <li class={itemClass}>
                <a
                    class='component-dropdown-menu-link'
                    title={link.title}
                    href={link.href}
                    onclick={link.onclick}
                    data-identifier={link.dataIdentifier}
                >
                    {icon}
                    <span class='component-dropdown-menu-link-text'>{link.title}</span>
                </a>
            </li>
        );
    }
}
