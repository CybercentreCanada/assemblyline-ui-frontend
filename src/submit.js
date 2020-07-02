import React, { useState, useEffect }  from "react";
import {Flex, Image, Tabs, TabList, Tab, TabPanel, TabPanels, Box, Text, Link} from "@chakra-ui/core";
import {useDropzone} from 'react-dropzone';
import {AiOutlineSecurityScan} from 'react-icons/ai'

function FileDropper(props) {
  const {acceptedFiles, getRootProps, getInputProps} = useDropzone();

  const files = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  return (
    <Box>
      <div {...getRootProps({className: 'dropzone'})}>
        <input {...getInputProps()} />
        <AiOutlineSecurityScan style={{fontSize: '140px'}}/>
        <Text fontSize="lg">Select a file to scan</Text>
      </div>
      <aside>
        <ul>{files}</ul>
      </aside>
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
            <p>URL input box</p>
          </TabPanel>
          <TabPanel>
            <p>Service options</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}

export default Submit;
