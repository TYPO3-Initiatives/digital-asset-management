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

define(['jquery', 'bootstrap', 'TYPO3/CMS/Backend/Icons'], function() {
    "use strict";
    var DigitalAssetManagementActions = {};

    DigitalAssetManagementActions.init = function () {
        console.log('DigitalAssetManagement.init');
        $.getJSON(TYPO3.settings.ajaxUrls.dam_request, {'getContent': '/'})
            .done(function (data) {
                DigitalAssetManagementActions.renderContent(data);
            })
            .fail(function (err) {
                console.log('DigitalAssetManagement request promise fail ' + JSON.stringify(err));
                top.TYPO3.Notification.warning('Request failed', 'Der Inhalt can not be displayed. ' + err.readyState);
                DigitalAssetManagementActions.renderError(err);
            });
    };

    DigitalAssetManagementActions.renderError = function (err) {
        $('.errorlog').html(err.responseText);
    };

    DigitalAssetManagementActions.renderContent = function (data) {
        if (data && data.request) {
            $('.errorlog').html(data.request + data.response);
        }
        if (data.content && data.content.files || data.content.folder) {
            //Show folders and files
            var html = "";
            for (var i = 0; i < data.content.folders.length; i++) {
                var folder = data.content.folders[i];
                console.log(folder);
                for (var prop in folder) {
                    if (folder.hasOwnProperty(prop)) {
                        console.log("prop " + prop + ": " + folder[prop]);
                    }
                }
                var icon = top.TYPO3.Icons.getIcon('apps-filetree-folder');
                console.log(icon);
                //@todo: use moment.js for date-formatting?!
                //@todo: how to get the thumbnail images without viewhelper?
                html += '  <div class="card d-inline-block" style="width: 180px;">\n' +
                    '   <img class="card-img-top" src="'+icon+'" data-src="' + folder.uid + '" width="180" height="120"/>\n' +
                    '   <div class="card-body">\n' +
                    '   <h5 class="card-title">' + folder[' * name'] + '</h5>\n' +
                    '    <p class="card-text">&nbsp;</p>\n' +
                    '    <a href="#" class="btn btn-primary">Go somewhere</a>\n' +
                    '    </div>\n' +
                    '  </div>\n';
            }
            $('.folders').html(html);
            html = "";
            for (var i = 0; i < data.content.files.length; i++) {
                var file = data.content.files[i];
                console.log(file);
                //@todo: use moment.js for date-formatting?!
                //@todo: how to get the thumbnail images without viewhelper?
                html += '<div class="card d-inline-block" style="width: 180px;">\n' +
                    '    <img class="card-img-top" src="PlaceholderImage" data-src="' + file.uid + '" width="180" height="120"/>\n' +
                    '    <div class="card-body">\n' +
                    '    <h5 class="card-title">' + file.name + '</h5>\n' +
                    '    <p class="card-text">Size: ' + file.size + ' <br>Modified: ' + file.uid + ' ' + '' + '</p>\n' +
                    '    <a href="#" class="btn btn-primary">Go somewhere</a>\n' +
                    '    </div>\n' +
                    '  </div>\n';
            }
            $('.files').html(html);
        } else {
            //Show storage infos
        }
    };
    $(DigitalAssetManagementActions.init);

    return TYPO3.DigitalAssetManagementActions = DigitalAssetManagementActions;
});

