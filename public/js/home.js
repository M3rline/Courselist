$('#search').keyup(event => {
    if (event.which !== 13) {
        var value = $('#search').val();
        console.log('Searching for ',value);
        if (value && value.length > 0) {
            $('.card-content').each((i, el) => {
                var fulltext = $(el).attr('data-fulltext');
                var name = $(el).attr('data-name');
                var regex = new RegExp(value, 'i');
                if (regex.test(fulltext) || regex.test(name))
                    $(el).parent().show();
                else
                    $(el).parent().fadeOut();
            });
        }else{
            $('.card-content').parent().fadeIn();
        }

    }
});

$('#clear-search').click(event=>{
    $('#search').val('');
    $('.card-content').fadeIn();
});