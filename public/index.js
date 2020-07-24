if (document.body) {
    // body is exists 

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
                $('.Draw').html(response.data)
            }, (error) => {
                $('.Draw').html(error.response.data.data)
            });
    };

    function uploadFile() {
        var fileInput = document.getElementById('file-upload');
        var name = fileInput.files[0].name
        if (name.length > 20) {
            name = name.substring(0, 18) + "...";
            $('.custom-file-upload').text(name)
        }
        else {
            $('.custom-file-upload').text(name)
        }
    };

    document.getElementById("ConvertButton").addEventListener('click', submitFile);
    document.getElementById("file-upload").addEventListener('input', uploadFile, false)

}
