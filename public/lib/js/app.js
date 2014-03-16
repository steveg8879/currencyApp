function calculate() {
    var amount = $('#dollar-amt').val();
    if(!amount){
        alert('Please enter a valid amount!');
    }
    else{
        $.ajax({
            url: '/convertUSD',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({amount: amount}),
            success: function (response) {
                $('#amt-cad').html(response.cad);
                $('#amt-eur').html(response.eur);
                $('#amt-gbp').html(response.gbp);

            }

        });
    }
}
