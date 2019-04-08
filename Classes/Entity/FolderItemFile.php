<?php
declare(strict_types = 1);

/*
 * This file is part of the package typo3/cms-digital-asset-management.
 *
 * For the full copyright and license information, please read the
 * LICENSE file that was distributed with this source code.
 */

namespace TYPO3\CMS\DigitalAssetManagement\Entity;

use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\Imaging\Icon;
use TYPO3\CMS\Core\Imaging\IconFactory;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Utility\GeneralUtility;

/**
 * Immutable file object (not an image recognized by TYPO3), used by getFolderItemsAction().
 *
 * @see FolderItemFolder
 * @see FolderItemImage
 */
class FolderItemFile implements \JsonSerializable
{
    /**
     * @var string Always set to "file"
     */
    protected $type = 'file';

    /**
     * @var int FAL identifier, eg. "42:/path/to/file"
     */
    protected $identifier;

    /**
     * @var string Full file name without path, eg. "myFile.txt"
     */
    protected $name;

    /**
     * @var int File modification timestamp, eg. 1553705583
     */
    protected $mtime;

    /**
     * @var string $mtime formatted for display, eg. "30.02.2042"
     */
    protected $mtimeDisplay;

    /**
     * @var FilePermission Entity representing access permissions
     */
    protected $permissions;

    /**
     * @var string File extension / ending, eg. "txt"
     */
    protected $extension;

    /**
     * @var int File size in bytes, eg. 12345
     */
    protected $size;

    /**
     * @var string $size formatted for display, eg. "42KB"
     */
    protected $sizeDisplay;

    /**
     * @var array @TODO Details of translated meta data of this file, to be defined
     */
    protected $translations;

    /**
     * @var int Number of other records referencing this file, eg. 5
     */
    protected $references;

    /**
     * @var string Icon identifier matching mime type or extension, eg. "mimetypes-text-text"
     */
    protected $iconIdentifier;

    /**
     * Url to edit meta data of file, eg.
     * "/typo3/index.php?route=/record/edit&token=06db97b96d1e73ec14bf5d1f35604b20843d54f4&edit[sys_file_metadata][108]=edit"
     *
     * @var string
     */
    protected $editMetaUrl;

    /**
     * Url to edit editable files like text files. Empty if file is not editable. eg. ""
     *
     * @todo Not yet implemented
     * @var string
     */
    protected $editContentUrl;

    /**
     * @var string
     */
    protected $publicUrl;

    /**
     * @param File $file
     */
    public function __construct(File $file)
    {
        $this->identifier = $file->getCombinedIdentifier();
        $this->name = $file->getName();
        $this->mtime = $file->getModificationTime();
        $this->mtimeDisplay = BackendUtility::date($this->mtime) ?? '';
        $this->permissions = new FilePermission($file);
        $this->extension = $file->getExtension();
        $this->size = $file->getSize();
        $this->sizeDisplay = GeneralUtility::formatSize(
            $this->size,
            $this->getLanguageService()->sL('LLL:EXT:core/Resources/Private/Language/locallang_common.xlf:byteSizeUnits')
        );
        $this->translations = [];
        $this->references = (int)BackendUtility::referenceCount('sys_file', $file->getUid());
        $this->iconIdentifier = GeneralUtility::makeInstance(IconFactory::class)
            ->getIconForResource($file, Icon::SIZE_SMALL)
            ->getIdentifier();
        $uriBuilder = GeneralUtility::makeInstance(UriBuilder::class);
        $urlParameters = [
            'edit' => [
                'sys_file_metadata' => [
                    $file->getMetaData()['uid'] => 'edit',
                ],
            ],
            'returnUrl' => (string)$uriBuilder->buildUriFromRoute('file_DigitalAssetManagement'),
        ];
        $this->editMetaUrl = (string)$uriBuilder->buildUriFromRoute('record_edit', $urlParameters);
        $this->editContentUrl = '';
        $this->publicUrl = $file->getPublicUrl();
    }

    public function jsonSerialize()
    {
        return [
            'type' => $this->type,
            'identifier' => $this->identifier,
            'name' => $this->name,
            'mtime' => $this->mtime,
            'mtimeDisplay' => $this->mtimeDisplay,
            'permissions' => $this->permissions,
            'extension' => $this->extension,
            'size' => $this->size,
            'sizeDisplay' => $this->sizeDisplay,
            'translations' => $this->translations,
            'references' => $this->references,
            'iconIdentifier' => $this->iconIdentifier,
            'editMetaUrl' => $this->editMetaUrl,
            'editContentUrl' => $this->editContentUrl,
            'publicUrl' => $this->publicUrl,
        ];
    }

    /**
     * @return LanguageService
     */
    protected function getLanguageService()
    {
        return $GLOBALS['LANG'];
    }
}
