import Icon from '@/components/Icon';
import {AjaxRoutes} from '@/enums/AjaxRoutes';
import {Component, Vue} from 'vue-property-decorator';
import {CreateElement, VNode} from 'vue';
import {Action} from 'vuex-class';

@Component
export class NoStoragesModal extends Vue {
    @Action(AjaxRoutes.damGetStoragesAndMounts)
    getStorages!: Function;

    private render(h: CreateElement): VNode | null {
        return this.renderIfNonAdmin();
    }

    private renderIfAdmin(): VNode {
        return(
            <div>
                <h2>Your system has no asset storages configured.</h2>
                <p>
                    To manage or adding asdsets to your website you need to have a storage to save the assets.
                    Do you want t connect to a new storage now?
                </p>
                <Icon identifier='apps-filetree-mount' />
                <a href='#'>Connect storage</a>
            </div>
        );
    }

    private renderIfNonAdmin(): VNode {
        return(
            <div>
                <h2>You do not have sufficient permissions to access any storage folder.</h2>
                <p>Please contact your administrator for assistance.</p>
                <p>
                    <strong>Username:</strong> face@yomama.com<br />
                    <strong>Reference: </strong> #123456789
                </p>
                <a href='#' class='btn btn-block btn-default'>Switch User</a>
                <a href='#' class='btn btn-block btn-success' onclick={() => this.getStorages()}>
                    <Icon identifier='actions-refresh' /> Refresh
                </a>
            </div>
        );
    }
}
