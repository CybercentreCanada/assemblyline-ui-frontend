import {Box, Button, Image, Input, Stack, Text} from "@chakra-ui/core";
import React from "react";

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
    return (
        <Stack marginTop="3rem">
            <Input name="username" placeholder="Username"/>
            <Input type="password" name="password" placeholder="Password"/>
            <Button>Sign in</Button>
            <div style={{"margin-top": "1rem", display: "block", "text-align": "center", "font-size": "0.75rem"}}>
                Do not have an account? <Button size="xs" variant="link">Sign up!</Button>
            </div>
            <div style={{"margin-top": ".5rem", display: "block", "text-align": "center", "font-size": "0.75rem"}}>
                Forgot password? <Button size="xs" variant="link">Reset it!</Button>
            </div>
        </Stack>
    );
}

function LoginScreen(){
    return (
        <div style={{position: "fixed", top: '50%', left: "50%", transform: "translate(-50%, -50%)"}}>
            <Box
                display={"grid"}
                borderWidth={{sm: "0", md: "1px"}}
                maxW={{sm: "xs", md: "22rem"}}
                minW={{sm: "xs", md: "22rem"}}
                rounded={"lg"}
                overflow={"hidden"}
                boxShadow={{sm: "", md: "lg"}}
                px={"2rem"}
                py={"3rem"}>
                <Image className="banner" src="banner.svg" alt="Assemblyline Logo"/>
                <UserPassLogin/>
                <Separator/>
                <AuthProvider name={"Azure AD"}/>
            </Box>
        </div>
    );
}

export default LoginScreen