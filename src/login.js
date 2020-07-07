import {Button, Input, Stack, useColorMode, useToast} from "@chakra-ui/core";
import React, {useState} from "react";
import Banner from "./banner"

function Separator(){
    return (
        <div>
            <div className="action_divider">
                <div>OR</div>
            </div>
        </div>
    );
}

function AuthProvider(props){
    return <Button>Sign in with {props.name}</Button>;
}

function UserPassLogin(){
    const toast = useToast();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    function login(username_p, password_p){
        const requestOptions = {
            method: 'POST',
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({user: username_p, password: password_p})
        };

        fetch('/api/v4/auth/login/', requestOptions)
            .then(res => {
                return res.json()
            })
            .catch(() => {
                return {
                        api_error_message: "Login API unreachable.",
                        api_response: "",
                        api_server_version: "4.0.0",
                        api_status_code: 400
                    }
            })
            .then(api_data => {
                if (api_data === undefined || !api_data.hasOwnProperty('api_status_code')){
                    toast({
                        title: "Login failure",
                        description: "Invalid data returned by login API.",
                        status: "error",
                        duration: 9000,
                        isClosable: true
                    })
                }
                else if (api_data.api_status_code !== 200){
                    toast({
                        title: "Login failure",
                        description: api_data.api_error_message,
                        status: "error",
                        duration: 9000,
                        isClosable: true
                    })
                }
                else {
                    window.location.reload(false);
                }
            });
    }

    return (
        <Stack marginTop="3rem">
            <Input name="username" placeholder="Username" onChange={(event) => setUsername(event.target.value)}/>
            <Input type="password" name="password" placeholder="Password" onChange={event => setPassword(event.target.value)}/>
            <Button onClick={() => login(username, password)}>Sign in</Button>
            <div style={{marginTop: "1rem", display: "block", textAlign: "center", fontSize: "0.75rem"}}>
                Do not have an account? <Button size="xs" variant="link">Sign up!</Button>
            </div>
            <div style={{marginTop: ".5rem", display: "block", textAlign: "center", fontSize: "0.75rem"}}>
                Forgot password? <Button size="xs" variant="link">Reset it!</Button>
            </div>
        </Stack>
    );
}

function LoginScreen(){
    const { colorMode } = useColorMode();

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
            <Stack
                borderWidth={{sm: "0", md: "1px"}}
                maxW={{sm: "xs", md: "22rem"}}
                minW={{sm: "xs", md: "22rem"}}
                rounded={"md"}
                overflow={"hidden"}
                boxShadow={{sm: "", md: "lg"}}
                px={"2rem"}
                py={"3rem"}
                backgroundColor={bgColor}>
                <Banner />
                <UserPassLogin/>
                <Separator/>
                <AuthProvider name={"Azure AD"}/>
            </Stack>
        </div>
    );
}

export default LoginScreen