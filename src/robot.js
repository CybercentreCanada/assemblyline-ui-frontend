import {Image, useColorMode} from "@chakra-ui/core";
import React from "react";

function Robot(){
    const colorMode = useColorMode();
    let banner;
    if (colorMode.colorMode === 'dark'){
        banner = "/al-robot_dark.svg"
    }
    else{
        banner = "/al-robot.svg"
    }
    return (
        <Image className="banner" src={banner} alt="Assemblyline Logo"/>
    );
}

export default Robot