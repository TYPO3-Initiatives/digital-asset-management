<?php
declare(strict_types = 1);

/*
 * This file is part of the package lns/digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

namespace TYPO3\CMS\DigitalAssetManagement\Entity;

/*
 * This file is part of the package lns/digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Core\Resource\ResourceStorage;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Immutable storage object, used by getStoragesAndMountsAction() for admin users.
 *
 * @see FileMount
 */
class Storage implements \JsonSerializable
{
    /**
     * @var string Always set to "storage"
     */
    protected $type = 'storage';

    /**
     * @var int The storage uid, eg. 42
     */
    protected $identifier;

    /**
     * @var string Speaking name of storage, identical with $storageName
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
     * @var string
     */
    protected $editStorageUrl;

    /**
     * @param ResourceStorage $storage
     */
    public function __construct(ResourceStorage $storage)
    {
        $this->identifier = $storage->getUid();
        $this->name = $this->storageName = $storage->getName();
        $this->storageType = $storage->getDriverType();
        $this->storageOnline = $storage->isOnline();
        $this->icon = 'apps-filetree-root';
        $uriBuilder = GeneralUtility::makeInstance(UriBuilder::class);
        $urlParameters = [
            'edit' => [
                'sys_file_storage' => [
                    $storage->getUid() => 'edit',
                ],
            ],
            'returnUrl' => (string)$uriBuilder->buildUriFromRoute('file_DigitalAssetManagement'),
        ];
        $this->editStorageUrl = (string)$uriBuilder->buildUriFromRoute('record_edit', $urlParameters);
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
            'icon' => $this->icon,
            'editStorageUrl' => $this->editStorageUrl,
        ];
    }
}
