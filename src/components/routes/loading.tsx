import React from "react";

import {CircularProgress, useTheme, Box} from "@material-ui/core";

import useAppLayout from "commons/components/hooks/useAppLayout";

function LoadingScreen(){
    const theme = useTheme()
    const { getBanner } = useAppLayout()
    
    return (
        <Box 
          style={{
              textAlign: "center",
              position: "fixed", 
              top: '50%', 
              left: "50%", 
              transform: "translate(-50%, -50%)"
              }}>
            { getBanner(theme) }
            <CircularProgress variant={"indeterminate"}/>
        </Box>
    );
}

export default LoadingScreen