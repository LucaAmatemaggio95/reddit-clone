import { Button, Flex, Image, Text } from "@chakra-ui/react";
import React from "react";
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { auth } from "../../../firebase/clientApp";

const OAuthButtons: React.FC = () => {
  const [signInWithGoogle, user, loading, userError] =
    useSignInWithGoogle(auth);

  return (
    <Flex direction={"column"} width={"100%"} mb={4}>
      <Button
        isLoading={loading}
        variant={"oauth"}
        mb={2}
        onClick={() => signInWithGoogle()}
      >
        <Image src="/images/googlelogo.png" alt="Google" height="20px" mr={4} />
        Continue with Google
      </Button>
      {userError && <Text>{userError.message}</Text>}
    </Flex>
  );
};
export default OAuthButtons;
