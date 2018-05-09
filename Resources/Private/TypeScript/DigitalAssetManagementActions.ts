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
import moment = require('moment');
// import Icons = require('TYPO3/CMS/Backend/Icons');


interface ResponseObject {
	method: string;
	params: any;
	result: any;

	request: any;
	response: any;
}

interface RequestCallback {
	(data: ResponseObject): void;
}


/**
 * Module: TYPO3/CMS/Backend/InfoWindow
 * @exports TYPO3/CMS/Backend/InfoWindow
 */
class DigitalAssetManagementActions {

	static folderPartial: string = '    <div class="grid folder-action {mimetype}" data-method="getContent" ' +
		'data-parameter="{identifier}">\n' +
		'   <div class="grid-cell" >\n' +
		'      <div class="icon folder-icon {type}"></div>' +
		'   </div>\n' +
		'   <div class="info">\n' +
		'      <div class="grid-cell filename"><h5 class="card-title">{name}</h5></div>\n' +
		'   </div>\n' +
		'  </div>\n';

	static filePartial: string = '<div class="grid file {mimetype}">\n' +
		// '    <img class="card-img-top" src="PlaceholderImage" data-src="{uid}" width="180" height="120"/>\n' +
		'    <div class="preview" >' +
		'<img src="/typo3conf/ext/digital_asset_management/Resources/Public/Images/empty.png" data-src="{identifier}"></div>\n' +
		'    <div class="grid-cell" >\n' +
		'        <div class="icon icon-mimetypes-{mimetype}" /></div>\n' +
		'    <div class="info">\n' +
		'      <div class="grid-cell filename"><h5>{name}</h5></div>\n' +
		'      <div class="grid-cell filesize"><p><span class="grid-label">{lll:dam.labels.filesize}: </span>{size}</p></div>\n' +
		'      <div class="grid-cell moddate"><p><span class="grid-label">{lll:dam.labels.modified}: \<n></n>' +
		'		</span>{modification_date_formated}</p></div>\n' +
		'    </div>' +
		'  </div>\n';

	static breadcrumbPartial: string = '<span class="folder-action" data-method="getContent" ' +
		'data-parameter="{identifier}">{label}</span>';

	/**
	 *
	 */
	public static init(): void {
		let my = DigitalAssetManagementActions;
		console.log('DigitalAssetManagement.init');
		// my.renderBreadcrumb('/');
		// @todo: get filetree starting point from user settings.
		my.request('getContent', '', my.genericRequestCallback);
		$('.digital-asset-management').on('click', '.folder-action', function(): void {
			let method = this.dataset.method;
			let parameter = this.dataset.parameter;
			console.log ( 'method: ' + method + ', par: ' + parameter);
			my.request(method, parameter, my.genericRequestCallback);
		});
		$('.digital-asset-management').on('click', '.view-action', function(): void {
			let action = this.dataset.action;
			let parameter = this.dataset.parameter;
			console.log ( 'action: ' + action + ', par: ' + parameter);
			// Remove all other view-* classes and add the clicked class
			$('.maincontent').removeClass(function (index: number, className: string): string {
				return (className.match (/(^|\s)view-\S+/g) || []).join(' ');
			}).addClass(action);
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
	 * @param data ResponseObject
	 */
	public static renderContent(data: ResponseObject): void {
		let my = DigitalAssetManagementActions;
		if (data && data.request) {
			$('.errorlog').html(data.request + data.response);
		}
		if (data.result && (data.result.files || data.result.folder)) {
			// Show folders and files
			let html = '';
			for (let i = 0; i < data.result.folders.length; i++) {
				const folder = data.result.folders[i];
				// Icons.getIcon('apps-filetree-folder', 'large').done( (iconMarkup: string): void => {
				// 	$('.folder-icon').html(iconMarkup);
				// });
				// @todo: how to get the thumbnail images without viewhelper?
				folder.mimetype = 'folder';
				//folder.modification_date_formated = moment(folder.modification_date).format(TYPO3.settings.DateTimePicker.DateFormat[1] || 'YYYY-MM-DD');
				html += my.replaceTemplateVars(my.folderPartial, folder);
			}
			$('.folders').html(html);
			html = '';
			// icon mimetypes-pdf
			for (let i = 0; i < data.result.files.length; i++) {
				const file = data.result.files[i];
				// @todo: how to get the thumbnail images without viewhelper?
				// Add mimetype as two classes: image/jpeg -> image jpeg
				file.mimetype = file.mimetype.replace('/', ' ');
				file.modification_date_formated = moment.unix(file.modification_date).format(top.TYPO3.settings.DateTimePicker.DateFormat[1] || 'YYYY-MM-DD');
				html += my.replaceTemplateVars(my.filePartial, file);
			}
			$('.files').html(html);
		} else {
			// Show storage infos
		}
	}

	protected static renderBreadcrumb(data: ResponseObject): void {
		let html = '';
		let my = DigitalAssetManagementActions;
		let lastidentifier = '';
		if (data.result && data.result.breadcrumbs) {
			for (let i = 0; i < data.result.breadcrumbs.length; i++) {
				const part = data.result.breadcrumbs[i];
				if (part.type === 'home') {
					part.label = TYPO3.lang['dam.labels.files'];
				} else {
					part.label = part.name;
					lastidentifier = part.identifier;
					html += '&nbsp;&gt;&nbsp;';
				}
				// Render single breadcrumb item
				html += my.replaceTemplateVars(my.breadcrumbPartial, part);
			}
			// Set actual identifier to reindex-action parameter
			$('.folder-action[data-method="reindexStorage"]').attr('data-parameter', lastidentifier).removeClass('disabled');
			// Add some classes
			if (html) {
				$('.breadcrumb').html(html).removeClass('empty');
			} else {
				$('.breadcrumb').html('').addClass('empty');
			}
			if (data.result.files.length) {
				$('.files').removeClass('empty');
			} else {
				$('.files').addClass('empty');
			}
			if (data.result.folders.length) {
				$('.folders').removeClass('empty');
			} else {
				$('.folders').addClass('empty');
			}
		}
	}

	/**
	 *  load thumbnail from getThumbnail
	 *  @todo: only request images which are in the viewport, and trigger this when scrolling
	 */
	protected static loadThumbs() {
		let my = DigitalAssetManagementActions;
		$('.grid.image').each(function(index, el){
			let $el = $(this).find('img');
			let src = $el.attr('data-src');
			if (src) {
				my.request('getThumbnail', src, my.renderThumb);
			}
		});
	}

	protected static renderThumb(data: ResponseObject) {
		let my = DigitalAssetManagementActions;
		if (data.result && data.result.thumbnail) {
			$('.grid.image').each(function (index, el) {
				let $el = $(this).find('img');
				if (data.params === $el.attr('data-src')){
					$el.attr('src', data.result.thumbnail);
					$(this).find('.icon').addClass('small');
					$(this).addClass('haspreview').css('width', 'auto');
				}
			});
		}
	}

	/**
	 * query a json backenendroute
	 *
	 * @param {string} method
	 * @param {array} parameter
	 * @param {string} callback
	 */
	protected static request(method: string, parameter: string, callback: RequestCallback): void {
		let my = DigitalAssetManagementActions;
		// @todo: why does TYPO3.sett... work here without top.?
		let query = {};
		let failedbefore = false;
		query['method'] = method;
		query['params']	= parameter;
		$.getJSON(TYPO3.settings.ajaxUrls.dam_request, query)
			.done((data: ResponseObject): void => {
				callback(data);
			})
			.fail((err: any): void => {
				console.log('DigitalAssetManagement request promise fail ' + JSON.stringify(err));
				if (!failedbefore) {
					top.TYPO3.Notification.warning('Request failed', 'Content can not be displayed. ' + err.readyState);
					failedbefore = true;
				}
				my.renderError(err);
			});
	}

	protected static genericRequestCallback(data: ResponseObject): void {
		let my = DigitalAssetManagementActions;
		let method = data.method;
		switch (method) {
			case 'getContent':
				my.renderBreadcrumb(data);
				my.renderContent(data);
				my.loadThumbs();
				break;
			case 'getThumbnail':
				my.renderThumb(data);
				break;
			default:
				top.TYPO3.Notification.warning('Request failed', 'Unknown method: ' + method);
		}
	};


	/**
	 * Replace template variables surrounded by {|}.
	 * Replace language keys surrounded by {lll:|}.
	 *
	 * @param {string} template
	 * @param {object} data
	 * @returns {string}
	 */
	protected static replaceTemplateVars(template: string, data: object): string {
		return template.replace(
				/{([:a-zA-Z_\.-]*)}/g,
				function(m: string, key: string): string {
					// console.log('translate key: '+ key + ', ' + data[key] );
					if (key.indexOf('lll:') === 0) {
						return TYPO3.lang[key.replace(/lll:/, '')] || key;
					} else {
						return data.hasOwnProperty(key) ? data[key] : '###missing prop:' + key + '#';
					}
				}
			);
	}
}

$(DigitalAssetManagementActions.init);

// expose as global object
TYPO3.DigitalAssetManagementActions = DigitalAssetManagementActions;
export = DigitalAssetManagementActions;
