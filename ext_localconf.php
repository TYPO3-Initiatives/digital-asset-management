<?php
if (TYPO3_REQUESTTYPE & TYPO3_REQUESTTYPE_BE) {
    \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(
        \TYPO3\CMS\Core\Page\PageRenderer::class
    )->addRequireJsConfiguration(
        [
            'paths' => [
                'Vue' => \TYPO3\CMS\Core\Utility\PathUtility::getAbsoluteWebPath(
                        \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extPath(
                            'digital_asset_management',
                            'Resources/Public/JavaScript/'
                        )
                    ) . 'Vue'
            ],
            'shim' => [
                'TYPO3/CMS/DigitalAssetManagement/Filelist' => [
                    'deps' =>  ['Vue']
                ],
                'Vue' => [
                    'exports' => ['Vue']
                ]
            ]
        ]
    );
}
