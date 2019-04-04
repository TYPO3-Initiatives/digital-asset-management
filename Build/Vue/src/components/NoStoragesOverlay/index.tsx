import Icon from '@/components/Icon';
import Overlay from '@/components/Overlay';
import {AjaxRoutes} from '@/enums/AjaxRoutes';
import {VNode} from 'vue';
import Component from 'vue-class-component';
import {Vue} from 'vue-property-decorator';
import {Action} from 'vuex-class';
import client from '@/services/http/Typo3Client';

@Component
export default class NoStoragesOverlay extends Vue {
    @Action(AjaxRoutes.damGetStoragesAndMounts)
    getStorages!: Function;

    private receivedUrl: string | null = null;

    constructor(props: any) {
        super(props);
    }

    private async getNewStorageUrl(): Promise<any> {
        const response = await client.get(TYPO3.settings.ajaxUrls[AjaxRoutes.damGetNewStorageUrl]);
        this.receivedUrl = response.data[0];
    }

    private async getLogoutUrl(): Promise<any> {
        const response = await client.get(TYPO3.settings.ajaxUrls[AjaxRoutes.damGetLogoutUrl]);
        this.receivedUrl = response.data[0];
    }

    private render(): VNode {
        const content = TYPO3.settings.BackendUser.isAdmin ? this.renderIfAdmin() : this.renderIfNonAdmin();
        return (
            <Overlay content={content} />
        );
    }

    private renderIfAdmin(): VNode {
        this.getNewStorageUrl();

        return(
            <div>
                <h2>Your system has no asset storages configured.</h2>
                <p>
                    To manage or adding asdsets to your website you need to have a storage to save the assets.
                    Do you want t connect to a new storage now?
                </p>
                <Icon identifier='apps-filetree-mount' />
                <a href={this.receivedUrl}>Connect storage</a>
            </div>
        );
    }

    private renderIfNonAdmin(): VNode {
        this.getLogoutUrl();

        return(
            <div>
                <h2>You do not have sufficient permissions to access any storage folder.</h2>
                <p>Please contact your administrator for assistance.</p>
                <p>
                    <strong>Username:</strong> {TYPO3.settings.BackendUser.username}<br />
                    <strong>Reference: </strong> #123456789
                </p>
                <a href={this.receivedUrl}>Switch User</a><br/>
                <a href='#' onclick={() => this.getStorages()}>
                    <Icon identifier='actions-refresh' /> Refresh
                </a>
            </div>
        );
    }
}
