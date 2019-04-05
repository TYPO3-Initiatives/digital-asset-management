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
                <h2>{TYPO3.lang['NoStorageOverlay.admin.headline']}</h2>
                <p>{TYPO3.lang['NoStorageOverlay.admin.content']}</p>
                <Icon identifier='apps-filetree-mount' />
                <a href={this.receivedUrl}>{TYPO3.lang['NoStorageOverlay.admin.button.connect']}</a>
            </div>
        );
    }

    private renderIfNonAdmin(): VNode {
        this.getLogoutUrl();

        return(
            <div>
                <h2>{TYPO3.lang['NoStorageOverlay.nonadmin.headline']}</h2>
                <p>{TYPO3.lang['NoStorageOverlay.nonadmin.contenjt']}</p>
                <p>
                    <strong>{TYPO3.lang['NoStorageOverlay.nonadmin.trace.username']}</strong> {TYPO3.settings.BackendUser.username}<br />
                    <strong>{TYPO3.lang['NoStorageOverlay.nonadmin.trace.reference']}</strong> #123456789
                </p>
                <a href={this.receivedUrl}>{TYPO3.lang['NoStorageOverlay.nonadmin.button.switchuser']}</a><br/>
                <a href='#' onclick={() => this.getStorages()}>
                    <Icon identifier='actions-refresh' /> {TYPO3.lang['NoStorageOverlay.nonadmin.button.refresh']}
                </a>
            </div>
        );
    }
}
