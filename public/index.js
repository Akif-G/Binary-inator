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
            console.log(i)
            bodyFormData.append(i.name, i.value)
            console.log(bodyFormData)
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
                console.log(response);
            }, (error) => {
                console.log(error);
            });
    };

    function uploadFile() {
        var fileInput = document.getElementById('file-upload');
        var name = fileInput.files[0].name
        console.log(name.length)
        if (name.length > 20) {
            name = name.substring(0, 18) + "...";
            $('.custom-file-upload').text(name)
        }
        else {
            $('.custom-file-upload').text(name)
        }
    };

    console.log(document.getElementById("ConvertButton"))
    document.getElementById("ConvertButton").addEventListener('click', submitFile);
    document.getElementById("file-upload").addEventListener('input', uploadFile, false)

}
