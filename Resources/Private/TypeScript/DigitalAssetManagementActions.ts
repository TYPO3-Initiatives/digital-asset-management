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

import * as $ from 'jquery';
import 'bootstrap';
import Icons = require('TYPO3/CMS/Backend/Icons');

/**
 * Module: TYPO3/CMS/Backend/InfoWindow
 * @exports TYPO3/CMS/Backend/InfoWindow
 */
class DigitalAssetManagementActions {

	static folderPartial: string = '    <div class="card folder-action d-inline-block" data-method="getContent" ' +
		'data-parameter="{identifier}" style="width: 180px;">\n' +
		'   <div class="icon folder-icon icon-apps-filetree-folder"></div>' +
		'   <div class="card-body">\n' +
		'   <h5 class="card-title">{name}</h5>\n' +
		'    <p class="card-text">&nbsp;</p>\n' +
		'    <a href="#" class="btn btn-primary">Go somewhere</a>\n' +
		'    </div>\n' +
		'  </div>\n';

	static filePartial: string = '<div class="card d-inline-block" style="width: 180px;">\n' +
		'    <img class="card-img-top" src="PlaceholderImage" data-src="{uid}" width="180" height="120"/>\n' +
		'    <div class="card-body">\n' +
		'    <h5 class="card-title">{name}</h5>\n' +
		'    <p class="card-text">Size: {size} <br>Modified: {uid} ' + '' + '</p>\n' +
		'    <a href="#" class="btn btn-primary">Go somewhere</a>\n' +
		'    </div>\n' +
		'  </div>\n';

	/**
	 *
	 */
	public static init(): void {
		let my = DigitalAssetManagementActions;
		// @todo: why does only 'top.' work here?
		console.log(top.TYPO3.lang['localize.wizard.header']);
		// todo: how include own labels?
		console.log(top.TYPO3.lang['mlang_tabs_tab']);
		console.log('DigitalAssetManagement.init');
		my.renderBreadcrumb('/');
		my.request('getContent', '/');
		$('.digital-asset-management').on('click', '.folder-action', function(): void {
			let method = $(this).data('method');
			let parameter = $(this).data('parameter');
			console.log ( 'method: ' + method + ', par: ' + parameter);
			my.request(method, parameter);
		});
	}

	/**
	 *
	 * @param err any
	 */
	public static renderError(err: any): void {
		$('.errorlog').html(err.responseText);
	}

	/**
	 *
	 * @param data object
	 */
	public static renderContent(data: any): void {
		let my = DigitalAssetManagementActions;
		if (data && data.request) {
			$('.errorlog').html(data.request + data.response);
		}
		if (data.getContent && (data.getContent.files || data.getContent.folder)) {
			// Show folders and files
			let html = '';
			for (let i = 0; i < data.getContent.folders.length; i++) {
				const folder = data.getContent.folders[i];
				console.log(folder);
				// Icons.getIcon('apps-filetree-folder', 'large').done( (iconMarkup: string): void => {
				// 	$('.folder-icon').html(iconMarkup);
				// });
				// @todo: use moment.js for date-formatting?!
				// @todo: how to get the thumbnail images without viewhelper?
				html += my.replaceTemplateVars(my.folderPartial, folder);
			}
			$('.folders').html(html);
			html = '';
			// icon mimetypes-pdf
			for (let i = 0; i < data.getContent.files.length; i++) {
				const file = data.getContent.files[i];
				console.log(file);
				// @todo: use moment.js for date-formatting?!
				// @todo: how to get the thumbnail images without viewhelper?
				html += my.replaceTemplateVars(my.filePartial, file);
			}
			$('.files').html(html);
		} else {
			// Show storage infos
		}
	}

	protected static renderBreadcrumb(identifier: string): void {
		let parts = identifier.split('/');
		let html = '';
		let path = '';
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			path += '/' + part[i];
			html += '&nbsp;&gt;&nbsp;<span class="folder-action" data-method="getContent" data-parameter="' + path + '">' + part + '</span>';
		}
		$('.breadcrumb').html(html);
	}

	/**
	 * query a json backenendroute
	 *
	 * @param {string} method
	 * @param {string} parameter
	 */
	protected static request(method: string, parameter: string): void {
		let my = DigitalAssetManagementActions;
		// @todo: why does TYPO3.sett... work here without top.?
		let query = {};
		query[method] = parameter;
		$.getJSON(TYPO3.settings.ajaxUrls.dam_request, query)
			.done((data: any): void => {
				switch (method) {
					case 'getContent':
						console.log(data);

						my.renderBreadcrumb(parameter);
						my.renderContent(data);
						break;
					default:
						top.TYPO3.Notification.warning('Request failed', 'Unknown method: ' + method);
				}
			})
			.fail((err: any): void => {
				console.log('DigitalAssetManagement request promise fail ' + JSON.stringify(err));
				top.TYPO3.Notification.warning('Request failed', 'Content can not be displayed. ' + err.readyState);
				my.renderError(err);
			});
	}

	/**
	 *
	 * @param {string} template
	 * @param {object} data
	 * @returns {string}
	 */
	protected static replaceTemplateVars(template: string, data: object): string {
		return template.replace(
				/{(\w*)}/g,
				function(m: string, key: string): string {
					return data.hasOwnProperty( key ) ? data[ key ] : ' -missing prop:' + key + '-';
				}
			);
	}
}

$(DigitalAssetManagementActions.init);

// expose as global object
TYPO3.DigitalAssetManagementActions = DigitalAssetManagementActions;
export = DigitalAssetManagementActions;
