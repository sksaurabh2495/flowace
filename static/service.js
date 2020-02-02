$(function(){
	var socket = io();

	socket.on('new request', function(data){

		if($('#userData').attr('pageuri') == 'cart'){

			if(data.uid == $('#userData').attr('uid') ){
				$('#messages').prepend(
					'<div id="request-'+data.id+'" class="message-box"><span class="msg-name1">'+data.productName+'</span><div class="msg-text">'+data.productPrice+'</div></div>'
				);
			}
		}
    });

    socket.on('placed request', function(data){

		if($('#userData').attr('pageuri') == 'orders'){

			if(data.uid == $('#userData').attr('uid') || $('#userData').attr('did') == 2 ){
				for(var i = 0; i < data.aData.length; i++){
					if(data.aData[i].status == 0){data.aData[i].status2="Confirmed";} if(data.aData[i].status == 1){data.aData[i].status2="Pending";} if(data.aData[i].status == -1){data.aData[i].status2="Sold Out";}
					var prependStr = '<div id="request-'+data.aData[i].id+'" class="message-box"><span class="msg-name1">'+data.aData[i].productName+'</span><div class="msg-text">'+data.aData[i].productPrice+'</div><div>'+data.aData[i].status2+'</div>';
					if($('#userData').attr('did') == 2){
						prependStr += '<button class="ui positive button action-btn" onclick="accept_request(this);">Accept</button><button class="ui negative button action-btn" onclick="reject_request(this);">Reject</button>';
					}
					prependStr += '</div>';
					$('#messages').prepend(prependStr);
				}
			}
		}
    });

    socket.on('approved request', function(data){

		$('#request-'+data.id).find('.action-btn').remove();
		$('#request-'+data.id).find('.msg-status').html('Confirmed');

    });

    socket.on('rejected request', function(data){

		$('#request-'+data.id).find('.action-btn').remove();
		$('#request-'+data.id).find('.msg-status').html('Sold Out');

    });

});

function accept_request(ref){
	var request_id = $(ref).parents('.message-box').attr('id');
	request_id = request_id.replace('request-', '');
	$(ref).parents('.message-box').find('.action-btn').addClass('disabled');
	$(ref).parents('.message-box').find('.positive.action-btn').addClass('loading');
	
	$.ajax({
			method: 'GET',
			url : '/accept',
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			dataType: 'json',
			data : {
				id: request_id
			}
		}).then(function (json){

			if(json.code === 555){
				$(ref).parents('.message-box').find('.msg-status').html('Confirmed');
			}

		},function (json){
        //console.log(json);
    });

}

function reject_request(ref){
	var request_id = $(ref).parents('.message-box').attr('id');
	request_id = request_id.replace('request-', '');
	$(ref).parents('.message-box').find('.action-btn').addClass('disabled');
	$(ref).parents('.message-box').find('.negative.action-btn').addClass('loading');
	
	$.ajax({
			method: 'GET',
			url : '/reject',
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			dataType: 'json',
			data : {
				id: request_id
			}
		}).then(function (json){

			if(json.code === 555){
				$(ref).parents('.message-box').find('.msg-status').html('Sold Out');
			}

		},function (json){
        //console.log(json);
    });

}

function place_order(){
	$('.place-order').addClass('loading disabled');

	$.ajax({
			method: 'GET',
			url : '/place',
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			dataType: 'json',
			data : {}
		}).then(function (json){

			if(json.code === 555){
				window.location.replace("./orders");
			}

		},function (json){
        //console.log(json);
    });

}

