jQuery('<div class="quantity-nav"><div class="quantity-button quantity-up">&uarr;</div><div class="quantity-button quantity-down">&darr;</div></div>').insertAfter('.quantity input');

jQuery('.quantity').each(function () {
    var spinner = jQuery(this),
        input = spinner.find('input[type="number"]'),
        //btnUp = spinner.find('.quantity-up'),
       // btnDown = spinner.find('.quantity-down'),
        btnUp = input.siblings('.quantity-nav').find('.quantity-up'),
        btnDown = input.siblings('.quantity-nav').find('.quantity-down'),
        min = input.attr('min'),
        max = input.attr('max');

    btnUp.click(function () {
        var oldValue = parseFloat(input.val()) || 0;
        if (oldValue >= max) {
            var newVal = oldValue;
        } else {
            var newVal = oldValue + 1;
        }
        spinner.find("input").first().val(newVal);
        spinner.find("input").first().trigger("input");
    });

    btnDown.click(function () {
        var oldValue = parseFloat(input.val());
        if (oldValue <= min) {
            var newVal = oldValue;
        } else {
            var newVal = oldValue - 1;
        }
        spinner.find("input").first().val(newVal);
        spinner.find("input").first().trigger("input");
    });

});