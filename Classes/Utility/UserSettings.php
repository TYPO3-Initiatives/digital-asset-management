<?php
declare(strict_types = 1);
namespace TYPO3\CMS\DigitalAssetManagement\Utility;

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


/**
 *
 *
 * @package TYPO3\CMS\DigitalAssetManagement\Utility
 */
class UserSettings
{
   /**
    * @var \TYPO3\CMS\Core\Authentication\BackendUserAuthentication
    */
    protected $user;

    /**
     * Default constructor
     */
    public function __construct()
    {
        $this->user = $this->getBackendUser();
    }

    /**
     * Get last visit path structure
     * @return string
     */
    public function getSavingPosition() : string
    {
        $result = '';
        if ($this->user->uc['damPath']) {
            $result = $this->user->uc['damPath'];
        }
        return $result;
    }

    /**
     * Save user path structure
     *
     * @param $lastVisitPath
     */
    public function setSavingPosition($lastVisitPath) : void
    {
        $this->user->uc['damPath'] = $lastVisitPath;
        $this->user->writeUC();
    }

    /**
     * Returns the current BE user.
     *
     * @return \TYPO3\CMS\Core\Authentication\BackendUserAuthentication
     */
    protected function getBackendUser()
    {
        return $GLOBALS['BE_USER'];
    }
}
