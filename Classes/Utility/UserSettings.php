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
     * Get last visit path structure
     * @return string
     */
    public static function getSavingPosition() : string
    {
        return unserialize($GLOBALS['BE_USER']->uc['damPath']);
    }

    /**
     * Save user path structure
     *
     * @param $lastVisitPath
     */
    public static function setSavingPosition($lastVisitPath) : void
    {
        $GLOBALS['BE_USER']->uc['damPath'] = serialize($lastVisitPath);
        $GLOBALS['BE_USER']->writeUC();
    }


}