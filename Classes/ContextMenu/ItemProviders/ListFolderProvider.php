<?php
declare(strict_types = 1);

/*
 * This file is part of the package typo3/cms-digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

namespace TYPO3\CMS\DigitalAssetManagement\ContextMenu\ItemProviders;

use TYPO3\CMS\Backend\ContextMenu\ItemProviders\AbstractProvider;
use TYPO3\CMS\Core\Resource\FolderInterface;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Click menu on a folder in list view
 * 'table' argument must be 'damListFolder-drag'
 * 'uid' argument must be a combinedIdentifier of a folder
 */
class ListFolderProvider extends AbstractProvider
{
    /**
     * @var array
     */
    protected $itemsConfiguration = [
        'newFile' => [
            'label' => 'New File',
            'iconIdentifier' => 'actions-page-new',
            'callbackAction' => '',
        ],
        'newFolder' => [
            'label' => 'New Folder',
            'iconIdentifier' => 'actions-folder',
            'callbackAction' => '',
        ],
        'upload' => [
            'label' => 'LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:cm.upload',
            'iconIdentifier' => 'actions-edit-upload',
            'callbackAction' => '',
        ],
        'download' => [
            'label' => 'Download',
            'iconIdentifier' => 'actions-download',
            'callbackAction' => '',
        ],
        'moveTo' => [
            'label' => 'Move to',
            'iconIdentifier' => 'actions-move',
            'callbackAction' => '',
        ],
        'copyTo' => [
            'label' => 'Copy to',
            'iconIdentifier' => 'actions-document-paste-into',
            'callbackAction' => '',
        ],
        'delete' => [
            'label' => 'Delete',
            'iconIdentifier' => 'actions-delete',
            'callbackAction' => '',
        ],
        'rename' => [
            'label' => 'Rename',
            'iconIdentifier' => 'actions-rename',
            'callbackAction' => '',
        ],
        'info' => [
            'label' => 'Details',
            'iconIdentifier' => 'actions-document-info',
            'callbackAction' => ''
        ],
    ];

    /**
     * @var FolderInterface
     */
    protected $folder;

    /**
     * @return bool
     */
    public function canHandle(): bool
    {
        // -drag suffix used to shut down ext:impexp provider that would add import and export items
        return $this->table === 'damListFolder-drag';
    }

    protected function initialize()
    {
        parent::initialize();
        $resourceFactory = GeneralUtility::makeInstance(ResourceFactory::class);
        $this->folder = $resourceFactory->retrieveFileOrFolderObject($this->identifier);
        if (!$this->folder instanceof FolderInterface) {
            throw new \InvalidArgumentException('uid must be either the combined identifier of a folder');
        }
    }
}
