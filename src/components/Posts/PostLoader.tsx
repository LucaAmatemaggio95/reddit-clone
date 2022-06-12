import { SkeletonText } from "@chakra-ui/react";
import React from "react";

type PostLoaderProps = {};

const PostLoader: React.FC<PostLoaderProps> = () => {
  return <SkeletonText mt="4" noOfLines={4} spacing="4" />;
};
export default PostLoader;
