<?php
declare(strict_types = 1);
namespace TYPO3\CMS\DigitalAssetManagement\Controller;

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Core\Http\HtmlResponse;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Backend\Template\ModuleTemplate;
use TYPO3Fluid\Fluid\View\ViewInterface;
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
     * @var ViewInterface
     */
    protected $view;

    /**
     * Default constructor
     */
    public function __construct()
    {
//        $this->siteFinder = GeneralUtility::makeInstance(SiteFinder::class);
        $this->moduleTemplate = GeneralUtility::makeInstance(ModuleTemplate::class);
    }

    /**
     * Main entry method: Dispatch to other actions - those method names that end with "Action".
     *
     * @param ServerRequestInterface $request the current request
     * @return ResponseInterface the response with the content
     */
    public function handleRequest(ServerRequestInterface $request): ResponseInterface
    {
//        $this->moduleTemplate->getPageRenderer()->loadRequireJsModule('TYPO3/CMS/Backend/ContextMenu');
        //include JavaScript and CSS
//        $this->moduleTemplate->getPageRenderer()->loadRequireJsModule('TYPO3/CMS/DigitalAssetManagement/DigitalAssetManagementActions');
        //@todo: use getPageRenderer()->loadRequireJsModule instead of loadJavascriptLib
        $this->moduleTemplate->loadJavascriptLib('EXT:digital_asset_management/Resources/Public/JavaScript/DigitalAssetManagementActions.js');
        $this->moduleTemplate->loadJavascriptLib('https://maxcdn.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js');
        $this->moduleTemplate->getPageRenderer()->addCssFile('EXT:digital_asset_management/Resources/Public/Css/digitalassetmanagement.css');
        //Include bootstrap css
        $this->moduleTemplate->getPageRenderer()->addCssFile('https://maxcdn.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css');
        $action = $request->getQueryParams()['action'] ?? $request->getParsedBody()['action'] ?? 'overview';
        $this->initializeView($action);
//            \TYPO3\CMS\Extbase\Utility\DebuggerUtility::var_dump($action);
        $result = call_user_func_array([$this, $action . 'Action'], [$request]);
        if ($result instanceof ResponseInterface) {
            return $result;
        }

        // Add shortcut button
        $buttonBar = $this->moduleTemplate->getDocHeaderComponent()->getButtonBar();
        $myButton = $buttonBar->makeShortcutButton()->setModuleName('my_info');
        $buttonBar->addButton($myButton);


        $this->moduleTemplate->setContent($this->view->render());
        return new HtmlResponse($this->moduleTemplate->renderContent());
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
     * List pages that have 'is_siteroot' flag set - those that have the globe icon in page tree.
     * Link to Add / Edit / Delete for each.
     */
    protected function overviewAction(): void
    {
        $backendUser = $this->getBackendUser();
        // Take the first object of the first storage
        $fileStorages = $backendUser->getFileStorages();
//        $fileStorage = reset($fileStorages);
//        if ($fileStorage) {
//            $this->folderObject = $fileStorage->getRootLevelFolder();
//        } else {
//            throw new \RuntimeException('Could not find any folder to be displayed.', 1349276894);
//        }
        $files = reset($fileStorages);

        $this->view->assign('storages', $fileStorages);
        $this->view->assign('files', $files);
        $this->view->assign('user', $backendUser);
    }

    /**
     * Returns an instance of LanguageService
     *
     * @return \TYPO3\CMS\Core\Localization\LanguageService
     */
    protected function getLanguageService()
    {
        return $GLOBALS['LANG'];
    }

    /**
     * Returns the current BE user.
     *
     * @return \TYPO3\CMS\Core\Authentication\BackendUserAuthentication
     */
    protected function getBackendUser()
    {
        return $GLOBALS['BE_USER'];
    }
}
