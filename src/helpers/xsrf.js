
function getXSRFCookie(){
    let xsrf_token = null;
    if (document.cookie !== undefined){
        try{
            xsrf_token = document.cookie
                .split('; ')
                .find(row => row.startsWith('XSRF-TOKEN'))
                .split('=')[1];
        }
        catch (ex){}
    }
    return xsrf_token;
}

export default getXSRFCookie