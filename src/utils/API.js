const baseURL = 'http://localhost:5000';

const makeRequest = ({
    url,
    successCallback,
    failureCallback,
    requestType
}) => {
    let promise;
    switch(requestType) {
        case 'GET': 
            promise = fetch(`${baseURL}/${url}`);
            break;
        default: 
            return;
    }

    promise
        .then((res) => {
            return res.json();
        })
        .then((jsonData) => {
            successCallback(jsonData);
        })
        .catch((err) => {
            failureCallback(err);
        })
}

export {
    baseURL, 
    makeRequest,
}