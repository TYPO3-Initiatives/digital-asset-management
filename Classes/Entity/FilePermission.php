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

use TYPO3\CMS\Core\Resource\File;

/**
 * Immutable permission object, used by FileItemFolder
 * entity to represent permissions of files including image files.
 */
class FilePermission implements \JsonSerializable
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
     * @param File $file
     */
    public function __construct(File $file)
    {
        $this->isReadable = $file->checkActionPermission('read');
        $this->isWritable = $file->checkActionPermission('write');
    }

    public function jsonSerialize()
    {
        return [
            'isReadable' => $this->isReadable,
            'isWritable' => $this->isWritable,
        ];
    }
}
