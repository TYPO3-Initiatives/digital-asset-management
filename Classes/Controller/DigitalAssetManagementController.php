<?php
declare(strict_types = 1);

/*
 * This file is part of the package typo3/cms-digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

namespace TYPO3\CMS\DigitalAssetManagement\Controller;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Template\ModuleTemplate;
use TYPO3\CMS\Core\Context\Context;
use TYPO3\CMS\Core\Http\HtmlResponse;
use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Fluid\View\StandaloneView;

/**
 * Backend controller: The "Digital Asset Management" module
 *
 * Optional replacement of filelist
 */
class DigitalAssetManagementController
{
    /**
     * @var ModuleTemplate
     */
    protected $moduleTemplate;

    /**
     * @var StandaloneView
     */
    protected $view;

    /**
     * Default constructor
     */
    public function __construct()
    {
        $this->moduleTemplate = GeneralUtility::makeInstance(ModuleTemplate::class);
    }

    /**
     * @param string $templateName
     */
    protected function initializeView(string $templateName): void
    {
        $this->view = GeneralUtility::makeInstance(StandaloneView::class);
        $this->view->setTemplate($templateName);
        $this->view->setTemplateRootPaths(['EXT:digital_asset_management/Resources/Private/Templates']);
        $this->view->setPartialRootPaths(['EXT:digital_asset_management/Resources/Private/Partials']);
        $this->view->setLayoutRootPaths(['EXT:digital_asset_management/Resources/Private/Layouts']);
    }

    /**
     * Main entry method: Dispatch to other actions - those method names that end with "Action".
     *
     * @param ServerRequestInterface $request the current request
     * @return ResponseInterface the response with the content
     */
    public function handleRequest(ServerRequestInterface $request): ResponseInterface
    {
        $backendUser = GeneralUtility::makeInstance(Context::class)->getAspect('backend.user');

        /**
         * @var PageRenderer $pageRenderer
         */
        $pageRenderer = $this->moduleTemplate->getPageRenderer();
        $pageRenderer->loadRequireJsModule('TYPO3/CMS/DigitalAssetManagement/DigitalAssetManagementActions');
        $pageRenderer->addCssFile('EXT:backend/Resources/Public/Css/backend.css');
        $pageRenderer->addCssFile('EXT:digital_asset_management/Resources/Public/JavaScript/Library/filelist.css');
        $pageRenderer->addInlineLanguageLabelFile('EXT:digital_asset_management/Resources/Private/Language/locallang_mod.xlf');
        $pageRenderer->addInlineLanguageLabelFile('EXT:digital_asset_management/Resources/Private/Language/locallang_vue.xlf');
        $pageRenderer->addInlineLanguageLabelFile('EXT:core/Resources/Private/Language/locallang_core.xlf', 'file_upload');
        $pageRenderer->addInlineSettingArray('BackendUser', [
            'isAdmin' => $backendUser->isAdmin(),
            'username' => $backendUser->get('username'),
        ]);
        $this->initializeView('index');
        // Add shortcut button
        $buttonBar = $this->moduleTemplate->getDocHeaderComponent()->getButtonBar();
        $myButton = $buttonBar->makeShortcutButton()->setModuleName('dam');
        $buttonBar->addButton($myButton);
        $this->moduleTemplate->setContent($this->view->render());
        return new HtmlResponse($this->moduleTemplate->renderContent());
    }
}
