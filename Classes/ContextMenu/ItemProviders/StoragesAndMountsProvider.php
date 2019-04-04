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
use TYPO3\CMS\Core\Resource\ResourceStorage;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Click menu on a storage or file mount
 * 'table' argument must be 'damStoragesAndMounts-drag'
 * 'uid' argument must be either the uid of a sys_file_storage, or a combinedIdentifier for a file mount
 */
class StoragesAndMountsProvider extends AbstractProvider
{
    /**
     * @var array
     */
    protected $itemsConfiguration = [
        'newFile' => [
            'label' => 'New File',
            'iconIdentifier' => 'actions-page-new',
            'callbackAction' => 'actionNewFile',
        ],
        'newFolder' => [
            'label' => 'New Folder',
            'iconIdentifier' => 'actions-folder',
            'callbackAction' => 'actionNewFolder',
        ],
        'upload' => [
            'label' => 'LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:cm.upload',
            'iconIdentifier' => 'actions-edit-upload',
            'callbackAction' => 'actionUpload'
        ],
        'editStorage' => [
            'label' => 'Edit Storage',
            'iconIdentifier' => 'actions-open',
            'callbackAction' => 'actionEditStorage'
        ],
        'info' => [
            'label' => 'Details',
            'iconIdentifier' => 'actions-document-info',
            'callbackAction' => 'actionInfo'
        ],
    ];

    /**
     * Registers the additional JavaScript RequireJS callback-module which will allow to display a notification
     * whenever the user tries to click on the "Hello World" item.
     * The method is called from AbstractProvider::prepareItems() for each context menu item.
     *
     * @param string $itemName
     * @return array
     */
    protected function getAdditionalAttributes(string $itemName): array
    {
        return [
            'data-callback-module' => 'TYPO3/CMS/DigitalAssetManagement/ContextMenuActions',
        ];
    }

    /**
     * @var ResourceStorage
     */
    protected $storage;

    /**
     * @var FolderInterface
     */
    protected $mount;

    /**
     * @return bool
     */
    public function canHandle(): bool
    {
        // -drag suffix used to shut down ext:impexp provider that would add import and export items
        return $this->table === 'damStoragesAndMounts-drag';
    }

    protected function initialize()
    {
        parent::initialize();
        $resourceFactory = GeneralUtility::makeInstance(ResourceFactory::class);
        if (is_numeric($this->identifier)) {
            $this->storage = $resourceFactory->getStorageObject($this->identifier);
        } else {
            $this->mount = $resourceFactory->retrieveFileOrFolderObject($this->identifier);
            if (!$this->mount instanceof FolderInterface) {
                throw new \InvalidArgumentException('uid must be either the uid of a storage, or a file mount folder');
            }
        }
    }

    protected function canRender(string $itemName, string $type): bool
    {
        if ($itemName === 'editStorage' && !$this->storage instanceof ResourceStorage) {
            return false;
        }
        return true;
    }
}
