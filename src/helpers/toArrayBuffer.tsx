
export default function toArrayBuffer(data){
    let uint8Array = new Uint8Array(data.length);
    for (let i = 0; i < uint8Array.length; i++){
        uint8Array[i] = data[i];
    }

    return uint8Array;
}
