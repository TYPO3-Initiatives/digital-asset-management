<?php
declare(strict_types = 1);
namespace TYPO3\CMS\DigitalAssetManagement\ContextMenu\ItemProviders;

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

use TYPO3\CMS\Backend\ContextMenu\ItemProviders\AbstractProvider;
use TYPO3\CMS\Core\Resource\FolderInterface;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Click menu on a empty section in list view
 * 'table' argument must be 'damListEmpty-drag'
 * 'uid' argument must be a combinedIdentifier of a folder
 */
class ListEmptyProvider extends AbstractProvider
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
        return $this->table === 'damListEmpty-drag';
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
