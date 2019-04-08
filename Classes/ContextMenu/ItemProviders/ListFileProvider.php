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
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Click menu on a file or image in list view
 * 'table' argument must be 'damListFile-drag'
 * 'uid' argument must be a combinedIdentifier of a file
 */
class ListFileProvider extends AbstractProvider
{
    /**
     * @var array
     */
    protected $itemsConfiguration = [
        'preview' => [
            'label' => 'Preview',
            'iconIdentifier' => 'actions-version-workspace-preview',
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
        'replace' => [
            'label' => 'Replace',
            'iconIdentifier' => 'actions-replace',
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
     * @var File
     */
    protected $file;

    /**
     * @return bool
     */
    public function canHandle(): bool
    {
        // -drag suffix used to shut down ext:impexp provider that would add import and export items
        return $this->table === 'damListFile-drag';
    }

    protected function initialize()
    {
        parent::initialize();
        $resourceFactory = GeneralUtility::makeInstance(ResourceFactory::class);
        $this->file = $resourceFactory->retrieveFileOrFolderObject($this->identifier);
        if (!$this->file instanceof File) {
            throw new \InvalidArgumentException('uid must be combined identifier of a file');
        }
    }

    protected function canRender(string $itemName, string $type): bool
    {
        if ($itemName === 'preview'
            && !GeneralUtility::inList($GLOBALS['TYPO3_CONF_VARS']['GFX']['imagefile_ext'], strtolower($this->file->getExtension()))
        ) {
            return false;
        }
        return true;
    }
}
