<?php
declare(strict_types = 1);
namespace TYPO3\CMS\DigitalAssetManagement\Entity;

/*
 * This file is part of the package lns/digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\Resource\Folder;
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\PathUtility;

/**
 * Immutable folder object, used by getFolderItemsAction().
 *
 * @see FolderItemFile
 * @see FolderItemImage
 */
class FolderItemFolder implements \JsonSerializable
{
    /**
     * @var string Always set to "folder"
     */
    protected $type = 'folder';

    /**
     * @var int FAL identifier, eg. "42:/path/to/folder"
     */
    protected $identifier;

    /**
     * @var string Folder name, not full path, eg. "myFolder"
     */
    protected $name;

    /**
     * @var int Folder modification timestamp, eg. 1553705583
     */
    protected $mtime;

    /**
     * @var string $mtime formatted for display, eg. "30.02.2042"
     */
    protected $mtimeDisplay;

    /**
     * @var int Number of sub items (folders, files, images), eg. 5
     */
    protected $itemCount;

    /**
     * @var FolderPermission Entity representing access permissions
     */
    protected $permissions;

    /**
     * Path to folder icon, relative to document root with leading slash, eg.
     * "/typo3conf/ext/digital_asset_management/Resources/Public/Images/empty.png"
     *
     * @var string
     */
    protected $icon;

    /**
     * @param Folder $folder
     */
    public function __construct(Folder $folder)
    {
        $this->identifier = $folder->getCombinedIdentifier();
        $this->name = $folder->getName();
        $this->mtime = $folder->getModificationTime();
        $this->mtimeDisplay = BackendUtility::date($this->mtime) ?? '';
        $this->itemCount = $folder->getFileCount() + count($folder->getSubfolders());
        $this->permissions = new FolderPermission($folder);
        $this->icon = PathUtility::getAbsoluteWebPath(
            GeneralUtility::getFileAbsFileName('EXT:digital_asset_management/Resources/Public/Images/empty.png')
        );
    }

    public function jsonSerialize()
    {
        return [
            'type' => $this->type,
            'identifier' => $this->identifier,
            'name' => $this->name,
            'mtime' => $this->mtime,
            'mtimeDisplay' => $this->mtimeDisplay,
            'itemCount' => $this->itemCount,
            'permissions' => $this->permissions,
            'icon' => $this->icon,
        ];
    }
}