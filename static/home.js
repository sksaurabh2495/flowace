$(function(){
	if($('#userData').attr('did') == 2){
		window.location.replace("./service/orders");
		return;
	}
	load_products();

});

function load_products(){

    $.ajax({
        method: 'GET',
        url : '/product',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        dataType: 'json',
        data : {}
    }).then(function (json){
        
        if(json.code === 555){
        	for (var i = 0 ; i < json.data.length ; i++){
        		$("#product-feed").append('<div class="product-item"><div class="title">'+ json.data[i].name +'</div><div class="description">'+ json.data[i].description +'</div><div class="price">Rs. '+ json.data[i].price +'/-</div><div class="footer"><button class="ui primary button create-btn" onclick="add_to_cart('+ json.data[i].id +', this);">Add to Cart</button></div></div>');
        	}
        }

    },function (json){
        //console.log(json);
    });

}

function add_to_cart(pid,ref){

	var data = {pid: pid, pname: $(ref).parents('.product-item').find('.title').text(), pprice: $(ref).parents('.product-item').find('.price').text()} ;
	$(ref).addClass('loading disabled');

	$.ajax({
		method: 'POST',
		url : '/request',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		dataType: 'json',
		data : data
	}).then(function (json){

		if(json.code === 555){
			$(ref).html('Added');
			$(ref).removeClass('loading');
		}
	},function (json){
	    $(ref).removeClass('loading disabled');
    });
}