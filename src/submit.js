import React, { useState, useEffect }  from "react";
import {Flex, Image, Tabs, TabList, Tab, TabPanel, TabPanels, Box, Text, Link, Button, Input} from "@chakra-ui/core";
import {useDropzone} from 'react-dropzone';
import {AiOutlineSecurityScan} from 'react-icons/ai'

function FileDropper(props) {
  const {acceptedFiles, getRootProps, getInputProps, isDragActive} = useDropzone();

  let dropperText;
  if (acceptedFiles.length > 0 ){
    dropperText = <Box>
        <Text textAlign={'center'} fontSize="lg"><b>{acceptedFiles[0].path}</b></Text>
        <Text textAlign={'center'} fontSize="sm">{acceptedFiles[0].size} bytes</Text>
      </Box>
  }
  else{
    dropperText = <Text fontSize="lg">Select a file to scan</Text>;
  }

  return (
    <Box>
      <div {...getRootProps()} className={acceptedFiles.length>0||isDragActive ? 'dropzone drag-enter' : 'dropzone'}>
        <input {...getInputProps()} />
        <AiOutlineSecurityScan style={{fontSize: '140px'}}/>
        {dropperText}
      </div>
      <Flex justify="center" marginTop="2rem">
        <Button
            variant="solid"
            display={acceptedFiles.length === 0 ? 'none' : 'initial'}>
          Upload and Scan
        </Button>
      </Flex>
    </Box>
  );
}

function Submit() {
  const [currentTime, setCurrentTime] = useState(-1);
  useEffect(()=> {
    fetch('/time').then(res => res.json()).then(data => {
      setCurrentTime(data.time);
    })
  }, []);
  return (
    <>
      <Flex justify="center"
            marginTop="20px"
            marginBottom="60px">
        <Image
            className="banner"
            src="banner.svg"
            alt="Assemblyline Logo"/>
      </Flex>
      <Tabs variant="enclosed">
        <TabList>
          <Tab>File</Tab>
          <Tab>Url</Tab>
          <Tab>Options</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box marginTop="30px">
              <FileDropper/>
              <Text color={{dark: "gray.200", light: "gray.600"}} marginTop="60px" fontSize="sm" textAlign="center">By clicking <i>Upload and Scan</i>, you consent to our <Link href="/tos.html">Terms of Service</Link>.</Text>
            </Box>
          </TabPanel>
          <TabPanel>
            <Flex marginTop="30px">
              <Input placeholder="Url to scan" />
              <Button marginLeft="1rem">Scan</Button>
            </Flex>
            <Text color={{dark: "gray.200", light: "gray.600"}} marginTop="60px" fontSize="sm" textAlign="center">By clicking <i>Scan</i>, you consent to our <Link href="/tos.html">Terms of Service</Link>.</Text>
          </TabPanel>
          <TabPanel>
            <Flex marginTop="30px">
              <p>Service options</p>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}

export default Submit;
