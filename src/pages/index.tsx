import { Stack } from "@chakra-ui/react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Post } from "../atoms/postAtom";
import CreatePostLink from "../components/Community/CreatePostLink";
import PageContent from "../components/Layout/PageContent";
import PostItem from "../components/Posts/PostItem";
import PostLoader from "../components/Posts/PostLoader";
import { auth, firestore } from "../firebase/clientApp";
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

  // get feed for authenticated users
  const buildUserHomeFeed = () => {};

  // get feed for not authenticated users
  const buildNoUserHomeFeed = async () => {
    setLoading(true);

    try {
      const postQuery = query(
        collection(firestore, "posts"),
        orderBy("voteStatus", "desc"),
        limit(10)
      );

      const postDOcs = await getDocs(postQuery);
      const posts = postDOcs.docs.map(doc => ({ id: doc.id, ...doc.data() }));

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
