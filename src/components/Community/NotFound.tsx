import { Button, Flex } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";

const CommunityNotFound: React.FC = () => {
  return (
    <Flex
      direction={"column"}
      justifyContent="center"
      alignItems={"center"}
      minHeight="60px"
    >
      Sorry the community does not exist or has been banned
      <Link href="/">
        <Button mt={4}>GO HOME</Button>
      </Link>
    </Flex>
  );
};
export default CommunityNotFound;
