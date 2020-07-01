import React, { useState, useEffect }  from "react";
import { Heading, Box, Text } from "@chakra-ui/core";

function Submit() {
  const [currentTime, setCurrentTime] = useState(-1);
  useEffect(()=> {
    fetch('/time').then(res => res.json()).then(data => {
      setCurrentTime(data.time);
    })
  }, []);
  return (
    <Box p={5}>
      <Heading>Welcome to Assemblyline</Heading>
  <Text>This is just some text... don't worry about this. {currentTime}</Text>
    </Box>
  );
}

export default Submit;
