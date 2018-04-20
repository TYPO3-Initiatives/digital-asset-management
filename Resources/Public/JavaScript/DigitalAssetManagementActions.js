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
define(["require","exports","jquery","TYPO3/CMS/Backend/Icons","bootstrap"],function(e,n,t,o){"use strict";var r=function(){function e(){}return e.init=function(){console.log(top.TYPO3.lang["localize.wizard.header"]),console.log(top.TYPO3.lang.mlang_tabs_tab),console.log("DigitalAssetManagement.init"),t.getJSON(TYPO3.settings.ajaxUrls.dam_request,{getContent:"/"}).done(function(n){e.renderContent(n)}).fail(function(n){console.log("DigitalAssetManagement request promise fail "+JSON.stringify(n)),top.TYPO3.Notification.warning("Request failed","Content can not be displayed. "+n.readyState),e.renderError(n)})},e.renderError=function(e){t(".errorlog").html(e.responseText)},e.renderContent=function(e){if(e&&e.request&&t(".errorlog").html(e.request+e.response),e.content&&e.content.files||e.content.folder){for(var n="",r=0;r<e.content.folders.length;r++){var s=e.content.folders[r];for(var i in console.log(s),s)s.hasOwnProperty(i)&&console.log("prop "+i+": "+s[i]);var a=o.getIcon("apps-filetree-folder","large");console.log(a),n+='  <div class="card d-inline-block" style="width: 180px;">\n   <img class="card-img-top" src="'+a+'" data-src="'+s.uid+'" width="180" height="120"/>\n   <div class="card-body">\n   <h5 class="card-title">'+s[" * name"]+'</h5>\n    <p class="card-text">&nbsp;</p>\n    <a href="#" class="btn btn-primary">Go somewhere</a>\n    </div>\n  </div>\n'}t(".folders").html(n),n="";for(r=0;r<e.content.files.length;r++){var l=e.content.files[r];console.log(l),n+='<div class="card d-inline-block" style="width: 180px;">\n    <img class="card-img-top" src="PlaceholderImage" data-src="'+l.uid+'" width="180" height="120"/>\n    <div class="card-body">\n    <h5 class="card-title">'+l.name+'</h5>\n    <p class="card-text">Size: '+l.size+" <br>Modified: "+l.uid+' </p>\n    <a href="#" class="btn btn-primary">Go somewhere</a>\n    </div>\n  </div>\n'}t(".files").html(n)}},e}();return t(r.init),TYPO3.DigitalAssetManagementActions=r,r});