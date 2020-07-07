import {Button, Input, Stack, useColorMode} from "@chakra-ui/core";
import React, {useEffect, useState, getCookieValue} from "react";
import Banner from "./banner"
import axios from 'axios';

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

function login(username, password){
    return axios.post('/api/v4/auth/login/', {user: username, password: password});
    const requestOptions = {
        method: 'POST',
        mode: 'cors',
        headers: { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': getCookieValue('XSRF-TOKEN')
        },
        credentials: "include",
        body: JSON.stringify({user: username, password: password})
    };

    return fetch('/api/v4/auth/login/', requestOptions)
        .then(res => res.json())
        .then(user => {
            window.location.reload(false);
        });
}

function UserPassLogin(){
    const [user, setUser] = useState({});
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

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

function LoginScreen(props){
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