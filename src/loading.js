import {CircularProgress, Flex} from "@chakra-ui/core";
import React from "react";
import Banner from "./banner"

function LoadingScreen(){
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
                <CircularProgress isIndeterminate/>
            </Flex>
        </div>
    );
}

export default LoadingScreen