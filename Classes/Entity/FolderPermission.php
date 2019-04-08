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
 * Immutable permission object, used by FolderItemFolder
 * entity to represent permissions of folders.
 */
class FolderPermission implements \JsonSerializable
{
    /**
     * @var bool True if entity is readable
     */
    protected $isReadable;

    /**
     * @var bool True if entity is writable
     */
    protected $isWritable;

    /**
     * @param Folder $folder
     */
    public function __construct(Folder $folder)
    {
        $this->isReadable = $folder->checkActionPermission('read');
        $this->isWritable = $folder->checkActionPermission('write');
    }

    public function jsonSerialize()
    {
        return [
            'isReadable' => $this->isReadable,
            'isWritable' => $this->isWritable,
        ];
    }
}
