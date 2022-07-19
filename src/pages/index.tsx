import { Stack } from "@chakra-ui/react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where
} from "firebase/firestore";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilValue } from "recoil";
import { communityState } from "../atoms/communitiesAtom";
import { Post } from "../atoms/postAtom";
import CreatePostLink from "../components/Community/CreatePostLink";
import PageContent from "../components/Layout/PageContent";
import PostItem from "../components/Posts/PostItem";
import PostLoader from "../components/Posts/PostLoader";
import { auth, firestore } from "../firebase/clientApp";
import { useCommunityData } from "../hooks/useCommunityData";
import usePosts from "../hooks/usePosts";

const Home: NextPage = () => {
  const [user, loadingUser] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const {
    postStateValue,
    setPostStateValue,
    onSelectPost,
    onDeletPost,
    onVote
  } = usePosts();
  const { communityStateValue } = useCommunityData();

  // get feed for authenticated users
  const buildUserHomeFeed = async () => {
    setLoading(true);

    try {
      if (communityStateValue.mySnippets.length > 0) {
        // get posts from the users' communities
        const myCommunityIds = communityStateValue.mySnippets.map(
          item => item.communityId
        );

        const postQuery = query(
          collection(firestore, "posts"),
          where("communityId", "in", myCommunityIds),
          limit(10)
        );
        const postDocs = await getDocs(postQuery);
        const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setPostStateValue(prev => ({
          ...prev,
          posts: posts as Post[]
        }));
      } else {
        buildNoUserHomeFeed();
      }
    } catch (error) {
      console.log("buildUserHomeFeed error ", error);
    }

    setLoading(false);
  };

  // get feed for not authenticated users
  const buildNoUserHomeFeed = async () => {
    setLoading(true);

    try {
      const postQuery = query(
        collection(firestore, "posts"),
        orderBy("voteStatus", "desc"),
        limit(10)
      );

      const postDocs = await getDocs(postQuery);
      const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setPostStateValue(prev => ({
        ...prev,
        posts: posts as Post[]
      }));
    } catch (error) {
      console.log("buildNoUserHomeFeed error", error);
    }

    setLoading(false);
  };

  const getUserPostVotes = () => {};

  // useEffects
  useEffect(() => {
    if (!user && !loadingUser) buildNoUserHomeFeed();
  }, [user, loadingUser]);

  useEffect(() => {
    if (communityStateValue.snippetFetched) buildUserHomeFeed();
  }, [communityStateValue.snippetFetched]);

  return (
    <PageContent>
      <>
        <CreatePostLink />
        {loading ? (
          <PostLoader />
        ) : (
          <Stack>
            {postStateValue.posts.map(item => (
              <PostItem
                key={item.id}
                post={item}
                userIsCreator={user?.uid === item.creatorId}
                userVoteValue={
                  postStateValue.postVotes.find(vote => vote.postId === item.id)
                    ?.voteValue
                }
                onVote={onVote}
                onSelectPost={onSelectPost}
                onDeletPost={onDeletPost}
                homePage
              />
            ))}
          </Stack>
        )}
      </>
      <>{/* {recommendations} */}</>
    </PageContent>
  );
};

export default Home;
