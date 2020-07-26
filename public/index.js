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
                const { data } = response;
                placeData(data.data);
            }, (error) => {
                $('.Draw').html(`<div style="padding:8.2rem">${error.response.data.data}</div>`)
            });
    };

    function placeData(data) {
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
        autoZoom();
    }

    function autoZoom() {

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
        var vh70 = $(window).height() * 0.7

        if (toRem(width) > 20) {//bigger than 20 rem
            var zoomRatio = 20 / (toRem(width));
            $('#Result').css("zoom", `${zoomRatio}`);

            //check out for the height now
            height = $("#Result").height()
            if (height > vh70) {//bigger than 70vh
                zoomRatio = (vh70) / height;
                $('#Result').css("zoom", `${zoomRatio}`);
            }

        }//check out for the heigth even no is found
        if (height > vh70) {//bigger than 70vh
            var zoomRatio = (vh70) / (height);
            $('#Result').css("zoom", `${zoomRatio}`);
        }
    }

    function autoReloadButton() {
        if ($('#autoReloadButton').prop('checked')) {
            var elements = $(".autoReload");
            elements.on('input', submitFile);
        }
        else {
            $(".autoReload").off("input");
        }
    }

    $("#ConvertButton").click(submitFile);
    $("#file-upload").change(uploadFile);
    $('#autoReloadButton').click(autoReloadButton);
});
