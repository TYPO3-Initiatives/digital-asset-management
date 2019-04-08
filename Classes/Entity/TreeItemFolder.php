<?php
declare(strict_types = 1);

/*
 * This file is part of the package typo3/cms-digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

namespace TYPO3\CMS\DigitalAssetManagement\Entity;

use TYPO3\CMS\Core\Resource\Folder;

/**
 * Immutable folder object, used by getFolderItemsAction().
 *
 * @see FolderItemFile
 * @see FolderItemImage
 */
class TreeItemFolder implements \JsonSerializable
{
    /**
     * @var string Folder name, not full path, eg. "myFolder"
     */
    protected $name;

    /**
     * @var string Always set to "folder"
     */
    protected $type = 'folder';

    /**
     * @var int FAL identifier, eg. "42:/path/to/folder"
     */
    protected $identifier;

    /**
     * Save state of folder is not part of MVP
     *
     * @var bool Folder is expanded, so children are visible, default: false
     */
    protected $expanded;

    /**
     * @var bool Folder has children
     */
    protected $hasChildren;

    /**
     * @var string Public path to Icon file, currently always points to apps-filetree-folder-default.svg
     */
    protected $icon = '/typo3/sysext/core/Resources/Public/Icons/T3Icons/apps/apps-filetree-folder-default.svg';

    /**
     * @param Folder $folder
     */
    public function __construct(Folder $folder)
    {
        $this->name = $folder->getName();
        $this->identifier = $folder->getCombinedIdentifier();
        $this->expanded = false;
        $this->hasChildren = count($folder->getSubfolders()) > 0;
    }

    public function jsonSerialize()
    {
        return [
            'name' => $this->name,
            'type' => $this->type,
            'identifier' => $this->identifier,
            'expanded' => $this->expanded,
            'hasChildren' => $this->hasChildren,
            'icon' => $this->icon
        ];
    }
}
