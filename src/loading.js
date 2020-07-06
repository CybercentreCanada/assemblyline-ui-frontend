import {useColorMode, CircularProgress, Flex} from "@chakra-ui/core";
import React from "react";
import Banner from "./banner"

function LoadingScreen(){
    const { colorMode, toggleColorMode } = useColorMode();

    let bgColor;
    if (colorMode === "dark"){
      bgColor = "gray.700";
    }
    else{
      bgColor = "white";
    }

    return (
        <div 
          style={{
              position: "fixed", 
              top: '50%', 
              left: "50%", 
              transform: "translate(-50%, -50%)"
              }}>
            <Banner />
            <Flex justify="center">
                <CircularProgress isIndeterminate></CircularProgress>
            </Flex>
        </div>
    );
}

export default LoadingScreen