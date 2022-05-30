import { Input, Button, Flex, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useSetRecoilState } from "recoil";
import { authModalState } from "../../../atoms/authModalAtom";

type SignUpProps = {};

const SignUp: React.FC<SignUpProps> = () => {
  const setAuthModalState = useSetRecoilState(authModalState);

  const [signupForm, setSignupForm] = useState({
    email: "",
    password: ""
  });

  // Firebase logic
  const onSubmit = () => {};
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // update form state
    setSignupForm(prev => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  const handleUpdateState = () => {
    setAuthModalState(prev => ({
      ...prev,
      view: "login"
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
        mb={2}
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
        name="confirmPassword"
        placeholder="Confirm password"
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
      <Button width={"100%"} height="36px" my={2} type="submit">
        Sign up
      </Button>
      <Flex fontSize={"9pt"} justifyContent="center">
        <Text mr={2}>Already a Redditor?</Text>
        <Text
          color={"blue.500"}
          fontWeight={700}
          cursor="pointer"
          onClick={handleUpdateState}
        >
          LOG IN
        </Text>
      </Flex>
    </form>
  );
};
export default SignUp;
