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

"use strict";

require(['jquery'], function($) {
    $(function() {
        todo.dam.init();
    });
});

var todo = {};
todo.dam = {};

todo.dam.init = function (){
    $.getJSON(TYPO3.settings.ajaxUrls.dam_request, {'getContent': '/'})
    .done(function(data){
        todo.dam.renderContent(data);
    })
    .fail(function(err){
        console.log('todo.dam. request promise fail ' + JSON.stringify(err));
        top.TYPO3.Notification.warning('Request failed', 'Der Inhalt can not be displayed. ' + err.readyState);
        todo.dam.renderError(err);
    });
};

todo.dam.renderError = function(err){
    $('.errorlog').html(err.responseText);
};

todo.dam.renderContent = function(data){
    if (data && data.request){
        $('.errorlog').html(data.request + data.response);
    }
    if (data.content && data.content.files || data.content.folder){
        //Show files and folders
        var html ="";
        for (var i=0; i < data.content.files.length; i++){
            var file = data.content.files[i];
            console.log(file);
            //@todo: use moment.js for date-formatting?!
            html += '<div class="card d-inline-block" style="width: 180px;">\n' +
                '\t\t\t\t\t\t\t\t\t<img class="card-img-top" src="PlaceholderImgae" data-src="'+file.uid+'" width="180c" height="120c"/>\n' +
                '\t\t\t\t\t\t\t\t\t<div class="card-body">\n' +
                '\t\t\t\t\t\t\t\t\t\t<h5 class="card-title">'+file.name+'</h5>\n' +
                '\t\t\t\t\t\t\t\t\t\t<p class="card-text">Size: '+file.size+' <br>Modified: '+file.uid+' '+''+'</p>\n' +
                '\t\t\t\t\t\t\t\t\t\t<a href="#" class="btn btn-primary">Go somewhere</a>\n' +
                '\t\t\t\t\t\t\t\t\t</div>\n' +
                '\t\t\t\t\t\t\t\t</div>\n';
        }
        $('.files').html(html);
    } else {
        //Show storage infos
    }
};


