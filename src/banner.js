import {Image, useColorMode} from "@chakra-ui/core";
import React from "react";

function Banner(){
    const colorMode = useColorMode();
    let banner;
    if (colorMode.colorMode === 'dark'){
        banner = "banner_dark.svg"
    }
    else{
        banner = "banner.svg"
    }
    return (
        <Image className="banner" src={banner} alt="Assemblyline Logo"/>
    );
}

export default Banner