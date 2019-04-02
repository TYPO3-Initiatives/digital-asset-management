<?php
declare(strict_types = 1);
namespace TYPO3\CMS\DigitalAssetManagement\Entity;

/*
 * This file is part of the package lns/digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

use TYPO3\CMS\Core\Imaging\IconFactory;
use TYPO3\CMS\Core\Resource\ResourceStorage;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Immutable file mount object, used by getStoragesAndMountsAction() for non-admin users.
 * Combines info of file mount and its storage.
 *
 * @see Storage
 */
class FileMount implements \JsonSerializable
{
    /**
     * @var string Always set to "mount"
     */
    protected $type = 'mount';

    /**
     * @var int FAL identifier, eg. "42:/path/to/mount"
     */
    protected $identifier;

    /**
     * @var string Speaking name of file mount
     */
    protected $name;

    /**
     * @var string Speaking name of storage, eg. "Some storage"
     */
    protected $storageName;

    /**
     * @var string Storage driver, eg. "Local"
     */
    protected $storageType;

    /**
     * @var bool True if storage is online
     */
    protected $storageOnline;

    /**
     * @var string Markup of the storage icon
     */
    protected $icon;

    /**
     * @param ResourceStorage $storage
     * @param array $fileMount
     */
    public function __construct(ResourceStorage $storage, array $fileMount)
    {
        $this->identifier = $storage->getUid() . ':' . $fileMount['path'];
        $this->name = $fileMount['title'];
        $this->storageName = $storage->getName();
        $this->storageType = $storage->getDriverType();
        $this->storageOnline = $storage->isOnline();
        $this->icon = GeneralUtility::makeInstance(IconFactory::class)->getIcon('apps-filetree-mount')->render();
    }

    public function jsonSerialize()
    {
        return [
            'type' => $this->type,
            'identifier' => $this->identifier,
            'name' => $this->name,
            'storageName' => $this->storageName,
            'storageType' => $this->storageType,
            'storageOnline' => $this->storageOnline,
            'icon' => $this->icon
        ];
    }
}