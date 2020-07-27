$(document).ready(function () {// body is exists 

    function uploadFile() {
        var fileInput = document.getElementById('file-upload');
        try {
            var name = fileInput.files[0].name
            if (name.length > 20) {
                name = name.substring(0, 18) + "...";
                $('.custom-file-upload').text(name)
            }
            else {
                $('.custom-file-upload').text(name)
            }
        }
        catch (err) {
            $('.custom-file-upload').text("UPLOAD A FILE")
        }
    };

    function submitFile(e) {
        e.preventDefault();

        //button effect
        var button = $("#ConvertButton")
        button.text('Loading...')
        button.addClass('loading')
        button.css({ 'cursor': 'wait' });

        const config = {
            headers: {
                'content-type': 'multipart/form-data'
            }
        }

        var bodyFormData = new FormData();
        const data = $('#submitForm').serializeArray()

        for (i of data) {
            bodyFormData.append(i.name, i.value)
        }

        var fileInput = document.getElementById('file-upload');
        var file = fileInput.files[0];
        bodyFormData.append('file', file)

        // send a POST request
        axios({
            method: 'post',
            url: '/uploadfile',
            data: bodyFormData
        }, config)
            .then((response) => {
                console.log(response)
                const { data } = response;
                placeData(data.data);

                button.removeClass('loading')
                button.text('Convert!')
                button.css({ 'cursor': 'default' });
            }, (error) => {
                $('.Draw').html(`<div style="padding:8.2rem">${error.response.data.data}</div>`);
                $('#Result').css("zoom", `${1}`);

                button.removeClass('loading')
                button.text('Convert!')
                button.css({ 'cursor': 'pointer' });

            });
    };

    const placeData = (data) => {
        var output = $('#output');
        output.empty();
        var outputElement = "";
        n = $("#width").val();
        for (var element of data.match(new RegExp('.{1,' + n + '}', 'g'))) {
            outputElementLetter = ""
            for (letter of element.split('')) {
                outputElementLetter += `<div class="outputLetter">${letter}</div>`
            }
            outputElement += `<div class="outputElement">${outputElementLetter}</div>`;
        }

        output.append(outputElement);
        autoZoom()
    }

    const autoZoom = () => {

        function toRem(length) {
            var rem = (count) => {
                var unit = $('html').css('font-size');

                if (typeof count !== 'undefined' && count > 0) {
                    return (parseInt(unit) * count);
                }
                else {
                    return parseInt(unit);
                }
            }
            return (parseInt(length) / rem(1));
        }

        var width = $("#Result").width();
        var height = $("#Result").height();
        var vh90 = $(window).height() * 0.9

        if (toRem(width) > 23) {//bigger than 20 rem
            var zoomRatio = 18 / (toRem(width));
            $('#Result').css("zoom", `${zoomRatio}`);
            //check out for the height now
            height = $("#Result").height()
        }
        //check out for the heigth even no is found
        if (height > vh90) {//bigger than 70vh
            var zoomRatio = (vh90) / (height);
            $('#Result').css("zoom", `${zoomRatio}`);
        }
    }

    function autoReloadButton(e) {
        if ($('#autoReloadButton').prop('checked')) {
            var elements = $(".autoReload")
            elements.keyup((e) => {
                if (e.keyCode === 13) {
                    submitFile(e)
                }
            });
        }
        else {
            $(".autoReload").off("keyup");
        }
    }

    $("#ConvertButton").click(submitFile);
    $("#file-upload").change(uploadFile);
    $('#autoReloadButton').click(autoReloadButton);
});
