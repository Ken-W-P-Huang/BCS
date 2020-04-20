export var RC4={
    decode:function(key,cipherText){
        return this.encode(key,cipherText)
    },
    encode:function(key,data){
        var keyLength=key.length,
            dataLength=data.length,
            cipherText=[],
            seq=[],j=0,r=0,q=0,temp,i
        for(i=0;i<256;++i){
            seq[i]=i
        }
        for(i=0;i<256;++i){
            j=(j+(temp=seq[i])+key.charCodeAt(i%keyLength))%256;
            seq[i]=seq[j];
            seq[j]=temp
        }
        for(j=0;r<dataLength;++r){
            i=r%256;
            j=(j+(temp=seq[i]))%256;
            keyLength=seq[i]=seq[j];
            seq[j]=temp;
            cipherText[q++]=String.fromCharCode (data.charCodeAt(r) ^ seq[(keyLength+temp)%256])
        }
        return cipherText.join("")
    },
    key:function(length){
        for(var i=0,keys=[];i<length;++i){
            keys[i]=String.fromCharCode(1+((Math.random()*255) << 0))
        }
        return keys.join("")
    }
}
