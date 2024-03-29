import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Divider,
  Text,
  Input,
  Stack,
  Checkbox,
  Flex,
  Icon
} from "@chakra-ui/react";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { BsFillEyeFill, BsFillPersonFill } from "react-icons/bs";
import { HiLockClosed } from "react-icons/hi";
import { auth, firestore } from "../../../firebase/clientApp";
import useDirectory from "../../../hooks/useDirectory";

type CreateCommunityModalProps = {
  open: boolean;
  handleClose: () => void;
};

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  open,
  handleClose
}) => {
  const [user] = useAuthState(auth);
  const [communityName, setCommunityName] = useState("");
  const [charsRemaining, setCharsRemaining] = useState(21);
  const [communityType, setCommunityType] = useState("public");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toggleMenuOpen } = useDirectory();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > 21) return;

    setCommunityName(event.target.value);
    setCharsRemaining(21 - event.target.value.length);
  };

  const handleCommunityTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCommunityType(event.target.name);
  };

  const handleCreateCommunity = async () => {
    // validate the community name
    const format = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    if (format.test(communityName) || communityName.length < 3) {
      setError(
        "Community name must be between 3-21 characters, and can only contain letters, numbers and underscores"
      );
      return;
    }

    setLoading(true);

    try {
      // Create the community doc in firestore
      /*
      we need to get the document reference
      we use doc() from firestore, passing:
      - firestore inctance
      - name of the collection
      - id of the document: in this case community names are unique so we can usa that as ID
    */
      const communityDocRef = doc(firestore, "communities", communityName);

      // create transaction
      await runTransaction(firestore, async transaction => {
        // check if community exist inside the db
        const communityDoc = await transaction.get(communityDocRef);
        if (communityDoc.exists()) {
          throw new Error(`Sorry, r/${communityName} is taken. Try another.`);
        }

        // create the document
        transaction.set(communityDocRef, {
          creatorId: user?.uid,
          createdAt: serverTimestamp(),
          numberOfMembers: 1,
          privacyType: communityType
        });

        // create community snippet for user
        // every user ha the list of the communities that he has joined
        // collection/document/collection
        transaction.set(
          doc(firestore, `users/${user?.uid}/communitySnippets`, communityName),
          {
            communityId: communityName,
            isModerator: true
          }
        );
      });

      handleClose();
      toggleMenuOpen();
      router.push(`r/${communityName}`);
    } catch (errorMsg: any) {
      console.log(`handleCreateCommunity error`, error);
      setError(errorMsg.message);
    }

    setLoading(false);
  };

  return (
    <Modal isOpen={open} onClose={handleClose} size={"lg"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          display="flex"
          flexDirection={"column"}
          fontSize={15}
          padding={3}
        >
          Create a community
        </ModalHeader>
        <Box px={3}>
          <Divider />
          <ModalCloseButton />
          <ModalBody
            display={"flex"}
            flexDirection={"column"}
            padding={"10px 0px"}
          >
            <Text fontWeight={600} fontSize={15}>
              Name
            </Text>
            <Text fontSize={11} color="gray.500">
              Community names including capitalization cannot be changed
            </Text>
            <Text
              position={"relative"}
              top={"28px"}
              left={"10px"}
              width={"20px"}
              color="gray.400"
            >
              r/
            </Text>
            <Input
              size={"sm"}
              position={"relative"}
              value={communityName}
              paddingLeft={"22px"}
              onChange={handleChange}
            />
            <Text
              fontSize={"9pt"}
              color={charsRemaining === 0 ? "red" : "gray.500"}
            >
              {charsRemaining} Characters remaining
            </Text>
            <Text fontSize={"9pt"} color="red" pt={2}>
              {error}
            </Text>
            <Box my={4}>
              <Text fontWeight={600} fontSize={15}>
                Community Type
              </Text>
              <Stack spacing={2}>
                <Checkbox
                  name="public"
                  isChecked={communityType === "public"}
                  onChange={handleCommunityTypeChange}
                >
                  <Flex align="center">
                    <Icon as={BsFillPersonFill} color="gray.500" mr={2} />
                    <Text fontSize={"10pt"} mr={1}>
                      Public
                    </Text>
                    <Text fontSize={"8pt"} color="gray.500" pt={1}>
                      Anyone can view, post and comment to this community
                    </Text>
                  </Flex>
                </Checkbox>
                <Checkbox
                  name="restricted"
                  isChecked={communityType === "restricted"}
                  onChange={handleCommunityTypeChange}
                >
                  <Flex align="center">
                    <Icon as={BsFillEyeFill} color="gray.500" mr={2} />
                    <Text fontSize={"10pt"} mr={1}>
                      Restricted
                    </Text>
                    <Text fontSize={"8pt"} color="gray.500" pt={1}>
                      Anyone can view this community but only approved users can
                      post
                    </Text>
                  </Flex>
                </Checkbox>
                <Checkbox
                  name="private"
                  isChecked={communityType === "private"}
                  onChange={handleCommunityTypeChange}
                >
                  <Flex align="center">
                    <Icon as={HiLockClosed} color="gray.500" mr={2} />
                    <Text fontSize={"10pt"} mr={1}>
                      Private
                    </Text>
                    <Text fontSize={"8pt"} color="gray.500" pt={1}>
                      Only approved users can view and submit to this community
                    </Text>
                  </Flex>
                </Checkbox>
              </Stack>
            </Box>
          </ModalBody>
        </Box>

        <ModalFooter bg={"gray.100"} borderRadius="0px 0px 10px 10px">
          <Button
            variant={"outline"}
            height="30px"
            mr={3}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            height="30px"
            onClick={handleCreateCommunity}
            isLoading={loading}
          >
            Create community
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
export default CreateCommunityModal;
