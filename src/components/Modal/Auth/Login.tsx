import { Button, Flex, Input, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useSetRecoilState } from "recoil";
import { authModalState } from "../../../atoms/authModalAtom";
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "../../../firebase/clientApp";
import { FIREBASE_ERRORS } from "../../../firebase/errors";

type LoginProps = {};

const Login: React.FC<LoginProps> = () => {
  const setAuthModalState = useSetRecoilState(authModalState);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth);

  // Firebase logic
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    signInWithEmailAndPassword(loginForm.email, loginForm.password);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // update form state
    setLoginForm(prev => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  const handleUpdateState = () => {
    setAuthModalState(prev => ({
      ...prev,
      view: "signup"
    }));
  };

  // TEST ACCOUNT
  const handleClickReset = () => {
    setAuthModalState(prev => ({
      ...prev,
      view: "resetPassword"
    }));
  };

  return (
    <form onSubmit={onSubmit}>
      <Input
        required
        name="email"
        placeholder="Email"
        type="email"
        mb={2}
        onChange={onChange}
        fontSize="10pt"
        _placeholder={{
          color: "gray.500"
        }}
        _hover={{
          bg: "white",
          border: "1px solid",
          borderColor: "blue.500"
        }}
        _focus={{
          outline: "none",
          bg: "white",
          border: "1px solid",
          borderColor: "blue.500"
        }}
        bg={"gray.50"}
      />
      <Input
        required
        name="password"
        placeholder="Password"
        type="password"
        onChange={onChange}
        fontSize="10pt"
        _placeholder={{
          color: "gray.500"
        }}
        _hover={{
          bg: "white",
          border: "1px solid",
          borderColor: "blue.500"
        }}
        _focus={{
          outline: "none",
          bg: "white",
          border: "1px solid",
          borderColor: "blue.500"
        }}
        bg={"gray.50"}
      />
      <Text textAlign={"center"} color={"red"} fontSize={"10pt"}>
        {FIREBASE_ERRORS[error?.message as keyof typeof FIREBASE_ERRORS]}
      </Text>
      <Button
        isLoading={loading}
        width={"100%"}
        height="36px"
        my={2}
        type="submit"
      >
        Log in
      </Button>
      <Flex justifyContent={"center"} mb={2}>
        <Text fontSize={"9pt"} mr={1}>
          Forgot your password?
        </Text>
        <Text
          fontSize={"9pt"}
          color={"blue.500"}
          cursor={"pointer"}
          onClick={handleClickReset}
        >
          Reset
        </Text>
      </Flex>
      <Flex fontSize={"9pt"} justifyContent="center">
        <Text mr={2}>New here?</Text>
        <Text
          color={"blue.500"}
          fontWeight={700}
          cursor="pointer"
          onClick={handleUpdateState}
        >
          SIGN UP
        </Text>
      </Flex>
    </form>
  );
};
export default Login;
