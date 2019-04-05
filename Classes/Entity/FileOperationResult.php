<?php
declare(strict_types = 1);

/*
 * This file is part of the package lns/digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

namespace TYPO3\CMS\DigitalAssetManagement\Entity;

/**
 * Immutable permission object, used by FolderItemFolder
 * entity to represent permissions of folders.
 */
class FileOperationResult implements \JsonSerializable
{
    public const FAILED = 'FAILED';
    public const MOVED = 'MOVED';
    public const COPIED = 'COPIED';
    public const DELETED = 'DELETED';
    public const RENAMED = 'RENAMED';
    public const CREATED = 'CREATED';
    public const UPLOADED = 'UPLOADED';

    /**
     * @var string the identifier
     */
    protected $identifier;

    /**
     * @var string, one of the constants
     */
    protected $state;

    /**
      * @var string, The success or error message
      */
    protected $message;

    /**
     * @var \JsonSerializable|null
     */
    protected $resource;

    /**
     * @param string                 $identifier
     * @param string                 $state
     * @param string                 $message
     * @param \JsonSerializable|null $resource
     */
    public function __construct(string $identifier, string $state, string $message, \JsonSerializable $resource = null)
    {
        $this->identifier = $identifier;
        $this->state = $state;
        $this->message = $message;
        $this->resource = $resource;
    }

    public function jsonSerialize()
    {
        return [
            $this->identifier => [
                'status' => $this->state,
                'message' => $this->message,
                'resource' => $this->resource
            ]
        ];
    }
}
